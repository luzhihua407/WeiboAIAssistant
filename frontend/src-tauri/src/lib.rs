use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--flag1", "--flag2"])))
        .plugin(tauri_plugin_single_instance::init(|app, _argss, _cwdd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Folder {
                        path: std::path::PathBuf::from("d:/logs"),
                        file_name: None,
                    },
                ))
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            #[cfg(desktop)]
            {
                let autostart_manager = app.autolaunch();
                let _ = autostart_manager.enable();
                println!(
                    "registered for autostart? {}",
                    autostart_manager.is_enabled().unwrap()
                );
            }
            Ok(())
        })
        .setup(|app| {
            // 创建托盘菜单
            let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let menu=Menu::with_items(app, &[&quit_i])?;

            // 创建托盘图标
            TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        println!("退出菜单项被点击");
                        let _ = app.remove_tray_by_id("main_tray"); // 使用 remove_tray_by_id 移除托盘图标
                        app.exit(0);
                    }
                    _ => {
                        println!("未处理的菜单项: {:?}", event.id);
                    }
                })
                .on_tray_icon_event(|tray, event| match event {
                    TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up | MouseButtonState::Down,
                        ..
                    } => {
                        println!("左键点击托盘图标");
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus(); // 确保窗口被激活
                            let _ = window.set_always_on_top(true); // 临时设置为置顶
                            let _ = window.set_always_on_top(false); // 取消置顶以恢复正常行为
                        }
                    }
                    TrayIconEvent::Move { position, .. } => {
                        println!("托盘图标被移动到位置: {:?}", position);
                        // 在这里可以添加自定义逻辑，例如记录位置或触发其他操作
                    }
                    _ => {
                        println!("未处理的事件: {event:?}");
                    }
                })
                .icon(app.default_window_icon().unwrap().clone())
                .build(app)?; // 修复未处理的 Result

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
