module.exports = {
  apps: [
    {
      name: "backend",
      script: "src/app.js",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};