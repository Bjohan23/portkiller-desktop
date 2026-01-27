// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::process::Command;
use sysinfo::{System, Pid, ProcessRefreshKind};

/// Estructura para el resultado del escaneo de puerto
#[derive(Debug, Serialize, Deserialize)]
struct PortScanResult {
    port: u16,
    #[serde(rename = "inUse")]
    in_use: bool,
    process: Option<ProcessInfo>,
}

/// Información del proceso
#[derive(Debug, Serialize, Deserialize, Clone)]
struct ProcessInfo {
    name: String,
    pid: u32,
    path: String,
    command: String,
    user: Option<String>,
}

/// Resultado de matar un proceso
#[derive(Debug, Serialize, Deserialize)]
struct KillProcessResult {
    killed: bool,
    port: u16,
    pid: Option<u32>,
}

/// Tipo de error
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
enum ErrorType {
    PermissionDenied,
    PortFree,
    PortInvalid,
    ProcessNotFound,
    UnknownError,
}

/// Respuesta genérica de operación
#[derive(Debug, Serialize)]
struct OperationResponse<T> {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<ErrorType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    suggestion: Option<String>,
}

/**
 * Encuentra el PID del proceso que está usando un puerto
 */
fn find_pid_by_port(port: u16) -> Option<u32> {
    #[cfg(target_os = "windows")]
    {
        // En Windows usar netstat
        let output = Command::new("cmd")
            .args(&["/C", &format!("netstat -ano | findstr :{}", port)])
            .output()
            .ok()?;

        let stdout = String::from_utf8_lossy(&output.stdout);
        
        // Buscar PID en la última columna
        for line in stdout.lines() {
            if line.contains(&format!(":{}", port)) {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if let Some(pid_str) = parts.last() {
                    if let Ok(pid) = pid_str.parse::<u32>() {
                        return Some(pid);
                    }
                }
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        // En Unix/Linux/Mac usar lsof
        let output = Command::new("lsof")
            .args(&["-t", &format!("-i:{}", port)])
            .output()
            .ok()?;

        let stdout = String::from_utf8_lossy(&output.stdout);
        stdout.trim().parse::<u32>().ok()
    }

    None
}

/**
 * Obtiene información del proceso desde el PID
 */
fn get_process_info(pid: u32) -> Option<ProcessInfo> {
    let mut sys = System::new();
    // sysinfo 0.32 requires ProcessesToUpdate and update_all parameters
    sys.refresh_processes_specifics(
        sysinfo::ProcessesToUpdate::All,
        true,
        ProcessRefreshKind::everything()
    );

    let pid = Pid::from_u32(pid);
    let process = sys.process(pid)?;

    // Convert OsString command to String properly
    let command = process.cmd()
        .iter()
        .map(|s| s.to_string_lossy().to_string())
        .collect::<Vec<String>>()
        .join(" ");

    Some(ProcessInfo {
        name: process.name().to_string_lossy().to_string(),
        pid: pid.as_u32(),
        path: process.exe()
            .and_then(|p| p.to_str())
            .unwrap_or("")
            .to_string(),
        command,
        user: process.user_id().map(|uid| uid.to_string()),
    })
}

/**
 * Comando Tauri para buscar información de un puerto
 */
#[tauri::command]
async fn find_port(port: u16) -> Result<OperationResponse<PortScanResult>, String> {
    // Validar puerto
    if port == 0 {
        return Ok(OperationResponse {
            success: false,
            data: None,
            error: Some(ErrorType::PortInvalid),
            message: Some("El puerto debe estar entre 1 y 65535".to_string()),
            suggestion: Some("Ingresa un número de puerto válido".to_string()),
        });
    }

    // Buscar proceso usando el puerto
    match find_pid_by_port(port) {
        Some(pid) => {
            // Puerto en uso, obtener información del proceso
            match get_process_info(pid) {
                Some(process_info) => Ok(OperationResponse {
                    success: true,
                    data: Some(PortScanResult {
                        port,
                        in_use: true,
                        process: Some(process_info),
                    }),
                    error: None,
                    message: None,
                    suggestion: None,
                }),
                None => Ok(OperationResponse {
                    success: true,
                    data: Some(PortScanResult {
                        port,
                        in_use: false,
                        process: None,
                    }),
                    error: None,
                    message: None,
                    suggestion: None,
                }),
            }
        }
        None => {
            // Puerto libre
            Ok(OperationResponse {
                success: true,
                data: Some(PortScanResult {
                    port,
                    in_use: false,
                    process: None,
                }),
                error: None,
                message: None,
                suggestion: None,
            })
        }
    }
}

/**
 * Mata un proceso por PID
 */
fn kill_process_by_pid(pid: u32) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let output = Command::new("taskkill")
            .args(&["/F", "/PID", &pid.to_string()])
            .output()
            .map_err(|e| format!("Error ejecutando taskkill: {}", e))?;

        if output.status.success() {
            Ok(())
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            if stderr.to_lowercase().contains("access denied")
                || stderr.to_lowercase().contains("access is denied")
            {
                Err("PERMISSION_DENIED".to_string())
            } else {
                Err(format!("Error: {}", stderr))
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        let output = Command::new("kill")
            .args(&["-9", &pid.to_string()])
            .output()
            .map_err(|e| format!("Error ejecutando kill: {}", e))?;

        if output.status.success() {
            Ok(())
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            if stderr.to_lowercase().contains("permission denied")
                || stderr.to_lowercase().contains("operation not permitted")
            {
                Err("PERMISSION_DENIED".to_string())
            } else {
                Err(format!("Error: {}", stderr))
            }
        }
    }
}

/**
 * Comando Tauri para matar el proceso de un puerto
 */
#[tauri::command]
async fn kill_port(port: u16) -> Result<OperationResponse<KillProcessResult>, String> {
    // Primero encontrar el PID
    match find_pid_by_port(port) {
        Some(pid) => {
            // Intentar matar el proceso
            match kill_process_by_pid(pid) {
                Ok(()) => Ok(OperationResponse {
                    success: true,
                    data: Some(KillProcessResult {
                        killed: true,
                        port,
                        pid: Some(pid),
                    }),
                    error: None,
                    message: None,
                    suggestion: None,
                }),
                Err(err_msg) => {
                    if err_msg == "PERMISSION_DENIED" {
                        #[cfg(target_os = "windows")]
                        let suggestion = "Ejecuta PortKiller como Administrador (clic derecho → Ejecutar como administrador)";
                        
                        #[cfg(not(target_os = "windows"))]
                        let suggestion = "Ejecuta PortKiller con sudo o como root";

                        Ok(OperationResponse {
                            success: false,
                            data: None,
                            error: Some(ErrorType::PermissionDenied),
                            message: Some("No tienes permisos suficientes para terminar este proceso".to_string()),
                            suggestion: Some(suggestion.to_string()),
                        })
                    } else {
                        Ok(OperationResponse {
                            success: false,
                            data: None,
                            error: Some(ErrorType::UnknownError),
                            message: Some(err_msg),
                            suggestion: Some("Intenta ejecutar como administrador".to_string()),
                        })
                    }
                }
            }
        }
        None => Ok(OperationResponse {
            success: false,
            data: None,
            error: Some(ErrorType::ProcessNotFound),
            message: Some(format!("No se encontró ningún proceso usando el puerto {}", port)),
            suggestion: Some("El puerto podría estar libre o el proceso terminó recientemente".to_string()),
        }),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![find_port, kill_port])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
