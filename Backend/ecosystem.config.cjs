module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'npm',
      args: 'run dev',
      watch: true, // Automatically restart app on file changes
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
