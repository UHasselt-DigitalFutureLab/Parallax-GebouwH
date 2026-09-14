import "./style.css";
import * as pc from "playcanvas";
import {
  setMobileViewport,
  getSceneParams,
  createApp,
  loadSceneData,
  buildAssetMap,
  loadAssets,
  createCamera,
  createModelEntities,
  createSplatEntities,
  createEntityHierarchy,
  createDebugPanel,
  createOverlayUI,
  setupSceneEnvironment,
  SceneParams,
} from "@splatting/core";

window.pc = pc;

async function bootstrap() {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const app = createApp(canvas);

  try {
    const [basePath, sceneData, elementsData] = await loadSceneData(
      app,
      "scene",
    );
    console.log("Loaded scene data:", sceneData, elementsData);

    const { assets, splatAssets, modelAssets } = buildAssetMap(
      basePath,
      sceneData,
    );
    await loadAssets(app, assets);

    const camera = createCamera(app, sceneData, elementsData.camera, {
      hasCamArgs: false,
    } as SceneParams);

    const modelEntities = createModelEntities(
      app,
      sceneData.models,
      modelAssets,
    );
    const splatEntities = createSplatEntities(app, sceneData, splatAssets);

    const sceneEntities = createEntityHierarchy(app, elementsData.groups, {
      ...Object.fromEntries(
        modelEntities.map((entity) => [entity.name, entity]),
      ),
      ...Object.fromEntries(
        splatEntities.map((entity) => [entity.name, entity]),
      ),
    });

    const debugPanelSupported = Boolean(
      elementsData.ui?.debugPanel?.visibleInModes?.length,
    );
    if (debugPanelSupported) createDebugPanel(app, sceneEntities);

    createOverlayUI(app, camera, sceneData, elementsData, {
      mode: "normal",
    } as SceneParams);
    setupSceneEnvironment(app);
  } catch (err) {
    console.error("Failed to load scene:", err);
    document.body.innerHTML = `<div style="color:white; padding: 20px;">Failed to load scene</div>`;
  }
}

bootstrap().catch((err) => console.error("Initialization error:", err));
