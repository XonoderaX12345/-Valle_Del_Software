import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4300);

const authServiceUrl = process.env.AUTH_SERVICE_URL ?? "http://localhost:4101";
const usersServiceUrl = process.env.USERS_SERVICE_URL ?? "http://localhost:4102";
const cmsServiceUrl = process.env.CMS_SERVICE_URL ?? "http://localhost:4103";

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({
    service: "gateway",
    status: "ok",
    routes: {
      auth: "/api/auth",
      users: "/api/users",
      cms: "/api/cms"
    }
  });
});

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: authServiceUrl,
    changeOrigin: true
  })
);

app.use(
  "/api/users",
  createProxyMiddleware({
    target: usersServiceUrl,
    changeOrigin: true
  })
);

app.use(
  "/api/cms",
  createProxyMiddleware({
    target: cmsServiceUrl,
    changeOrigin: true
  })
);

app.listen(port, () => {
  console.log(`gateway listening on ${port}`);
});
