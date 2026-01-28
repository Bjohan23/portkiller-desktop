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
    framework: Option<String>,
    #[serde(rename = "isDocker")]
    is_docker: bool,
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
        return stdout.trim().parse::<u32>().ok();
    }

    #[cfg(target_os = "windows")]
    None
}

/**
 * Detecta el framework basado en el comando y nombre del proceso
 */
fn detect_framework(name: &str, command: &str) -> (Option<String>, bool) {
    let cmd_lower = command.to_lowercase();
    let name_lower = name.to_lowercase();
    
    let is_docker = cmd_lower.contains("docker") || name_lower.contains("docker");
    
    let framework = if cmd_lower.contains("node") || cmd_lower.contains("npm") || cmd_lower.contains("yarn") {
        Some("Node.js".to_string())
    } else if cmd_lower.contains("java") || cmd_lower.contains("jar") {
        Some("Java".to_string())
    } else if cmd_lower.contains("python") || cmd_lower.contains("pip") {
        Some("Python".to_string())
    } else if cmd_lower.contains("dotnet") || name_lower.contains("dotnet") {
        Some(".NET".to_string())
    } else if cmd_lower.contains("go ") || name_lower.contains("go-build") {
        Some("Go".to_string())
    } else if cmd_lower.contains("php") {
        Some("PHP".to_string())
    } else if is_docker {
        Some("Docker Container".to_string())
    } else {
        None
    };

    (framework, is_docker)
}

/**
 * Obtiene información del proceso desde el PID
 */
fn get_process_info(pid: u32, sys: &System) -> Option<ProcessInfo> {
    let pid_sys = Pid::from_u32(pid);
    let process = sys.process(pid_sys)?;

    let command = process.cmd()
        .iter()
        .map(|s| s.to_string_lossy().to_string())
        .collect::<Vec<String>>()
        .join(" ");

    let name = process.name().to_string_lossy().to_string();
    let (framework, is_docker) = detect_framework(&name, &command);

    Some(ProcessInfo {
        name,
        pid,
        path: process.exe()
            .and_then(|p| p.to_str())
            .unwrap_or("")
            .to_string(),
        command,
        user: process.user_id().map(|uid| uid.to_string()),
        framework,
        is_docker,
    })
}

/**
 * Comando Tauri para buscar información de un puerto
 */
#[tauri::command]
async fn find_port(port: u16) -> Result<OperationResponse<PortScanResult>, String> {
    if port == 0 {
        return Ok(OperationResponse {
            success: false,
            data: None,
            error: Some(ErrorType::PortInvalid),
            message: Some("El puerto debe estar entre 1 y 65535".to_string()),
            suggestion: Some("Ingresa un número de puerto válido".to_string()),
        });
    }

    let mut sys = System::new();
    sys.refresh_processes_specifics(
        sysinfo::ProcessesToUpdate::All,
        true,
        ProcessRefreshKind::everything()
    );

    match find_pid_by_port(port) {
        Some(pid) => {
            match get_process_info(pid, &sys) {
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
 * Comando Tauri para detectar procesos en puertos comunes
 */
#[tauri::command]
async fn detect_common_ports() -> Result<OperationResponse<Vec<PortScanResult>>, String> {
    let common_ports = vec![3000, 3001, 3306, 5173, 5432, 6379, 8000, 8080, 9229];
    let mut results = Vec::new();
    
    let mut sys = System::new();
    sys.refresh_processes_specifics(
        sysinfo::ProcessesToUpdate::All,
        true,
        ProcessRefreshKind::everything()
    );

    for port in common_ports {
        if let Some(pid) = find_pid_by_port(port) {
            if let Some(process_info) = get_process_info(pid, &sys) {
                results.push(PortScanResult {
                    port,
                    in_use: true,
                    process: Some(process_info),
                });
            }
        }
    }

    Ok(OperationResponse {
        success: true,
        data: Some(results),
        error: None,
        message: None,
        suggestion: None,
    })
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
    match find_pid_by_port(port) {
        Some(pid) => {
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
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![find_port, kill_port, detect_common_ports])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
