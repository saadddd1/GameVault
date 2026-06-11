module.exports = {
  apps: [{
    name: 'gemevault',
    script: 'node_modules/.bin/next',
    args: 'start -p 3000 -H 127.0.0.1',
    cwd: __dirname,
    env: {
      NODE_ENV: 'production',
      PORT: '3000',
      NODE_OPTIONS: '--max-old-space-size=384'
    },
    max_memory_restart: '450M',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_restarts: 50,
    restart_delay: 5000
  }]
}
