import { Command } from '@tauri-apps/plugin-shell';

async function startServer(){
    const command = Command.sidecar('bin/main');
    const output = await command.execute();
}
