import {
  chain,
  Rule,
  Tree,
  SchematicContext,
} from "@angular-devkit/schematics";
import { updateWorkspace } from "@schematics/angular/utility/workspace";
import { Schema } from "../schema";
import {
  getProjectFromWorkspace,
  getProjectTargetOptions,
} from "../../utils/project";

export function addThemeToAppStyles(options: Schema): Rule {
  const themePath = "./node_modules/angular-toaster/toaster.css";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (_host: Tree, _context: SchematicContext) => {
    return chain([
      addThemeStyleToTarget(options.project, "build", themePath),
      addThemeStyleToTarget(options.project, "test", themePath),
    ]);
  };
}

function addThemeStyleToTarget(
  projectName: string,
  targetName: "test" | "build",
  assetPath: string
): Rule {
  return updateWorkspace((workspace) => {
    const project = getProjectFromWorkspace(workspace, projectName);

    let targetOptions;
    try {
      targetOptions = getProjectTargetOptions(project, targetName);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return;
    }

    if (!targetOptions) {
      return;
    }

    if (!targetOptions["styles"]) {
      targetOptions["styles"] = [];
    }
    
    const styles = targetOptions["styles"] as (string | { input: string })[];

    const existingStyles = styles.map((s) =>
      typeof s === "string" ? s : s.input
    );

    if (existingStyles.includes(assetPath)) {
      return;
    }

    styles.push(assetPath);
  });
}