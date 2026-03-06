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
const convocatoriaServiceUrl = process.env.CONVOCATORIA_SERVICE_URL ?? "http://localhost:4104";
const cohortServiceUrl = process.env.COHORT_SERVICE_URL ?? "http://localhost:4105";
const activityServiceUrl = process.env.ACTIVITY_SERVICE_URL ?? "http://localhost:4106";
const evidenceServiceUrl = process.env.EVIDENCE_SERVICE_URL ?? "http://localhost:4107";
const certificateServiceUrl = process.env.CERTIFICATE_SERVICE_URL ?? "http://localhost:4108";
const seedbedServiceUrl = process.env.SEEDBED_SERVICE_URL ?? "http://localhost:4109";
const pmoServiceUrl = process.env.PMO_SERVICE_URL ?? "http://localhost:4110";
const reportServiceUrl = process.env.REPORT_SERVICE_URL ?? "http://localhost:4111";

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
      cms: "/api/cms",
      convocatoria: "/api/convocatoria",
      cohort: "/api/cohort",
      activity: "/api/activity",
      evidence: "/api/evidence",
      certificate: "/api/certificate",
      seedbed: "/api/seedbed",
      pmo: "/api/pmo",
      report: "/api/report"
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

app.use(
  "/api/convocatoria",
  createProxyMiddleware({
    target: convocatoriaServiceUrl,
    changeOrigin: true
  })
);

app.use(
  "/api/cohort",
  createProxyMiddleware({
    target: cohortServiceUrl,
    changeOrigin: true
  })
);

app.use(
  "/api/activity",
  createProxyMiddleware({
    target: activityServiceUrl,
    changeOrigin: true
  })
);

app.use(
  "/api/evidence",
  createProxyMiddleware({
    target: evidenceServiceUrl,
    changeOrigin: true
  })
);

app.use(
  "/api/certificate",
  createProxyMiddleware({
    target: certificateServiceUrl,
    changeOrigin: true
  })
);

app.use(
  "/api/seedbed",
  createProxyMiddleware({
    target: seedbedServiceUrl,
    changeOrigin: true
  })
);

app.use(
  "/api/pmo",
  createProxyMiddleware({
    target: pmoServiceUrl,
    changeOrigin: true
  })
);

app.use(
  "/api/report",
  createProxyMiddleware({
    target: reportServiceUrl,
    changeOrigin: true
  })
);

app.listen(port, () => {
  console.log(`gateway listening on ${port}`);
});
