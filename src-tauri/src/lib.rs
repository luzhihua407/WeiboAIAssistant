use std::process::Command;
use std::env;
use std::error::Error;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
// Function to spawn the Express server
fn start_server() -> Result<(), Box<dyn Error>> {
    let _output = tauri::async_runtime::block_on(async move {
        Command::new("main")
            .spawn()
            .expect("Failed to start Express server");
    });

    Ok(())
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        // .setup(|app: &mut tauri::App| {
        //     // Run the Express server based on environment
        //     if let Err(err) = start_server() {
        //         eprintln!("Failed to start Express server: {}", err);
        //     }

        //     Ok(())
        // })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
