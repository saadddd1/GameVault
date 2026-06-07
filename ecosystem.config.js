module.exports = {
  apps: [{
    name: 'gamevault',
    script: 'node_modules/.bin/next',
    args: 'start -p 3000',
    cwd: __dirname,
    env: {
      NODE_ENV: 'production',
      PORT: '3000',
      NODE_OPTIONS: '--max-old-space-size=384'
    },
    max_memory_restart: '400M',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_restarts: 10,
    restart_delay: 5000
  }]
}
