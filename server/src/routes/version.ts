import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// 版本信息接口
interface VersionConfig {
  version: string;
  lastUpdated: string;
  totalFiles: number;
  thresholds: {
    minorVersionFiles: number;
    majorVersionFiles: number;
  };
  history: Array<{
    version: string;
    releaseDate: string;
    description: string;
    filesModified: number;
    changeType: string;
  }>;
}

// 获取版本信息
router.get("/", async (req, res) => {
  try {
    const versionFilePath = path.join(process.cwd(), '../version.json');

    if (!fs.existsSync(versionFilePath)) {
      return res.json({
        success: true,
        data: {
          version: "0.1.0",
          lastUpdated: new Date().toISOString(),
          totalFiles: 0,
          thresholds: {
            minorVersionFiles: 5,
            majorVersionFiles: 20
          },
          history: []
        }
      });
    }

    const versionData: VersionConfig = JSON.parse(fs.readFileSync(versionFilePath, 'utf-8'));
    res.json({ success: true, data: versionData });
  } catch (error) {
    console.error("Error fetching version:", error);
    res.status(500).json({ success: false, error: "Failed to fetch version" });
  }
});

export default router;
