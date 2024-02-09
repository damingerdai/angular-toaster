import { chain, Rule, Tree, SchematicContext } from "@angular-devkit/schematics";
import { getWorkspace, ProjectDefinition, updateWorkspace } from "@schematics/angular/utility/workspace";
import { ProjectType } from "@schematics/angular/utility/workspace-models";
import { addModuleImportToRootModule, getProjectFromWorkspace, getProjectMainFile, getProjectTargetOptions, hasNgModuleImport } from "../utils";
import { Schema } from "./schema";
import { getAppModulePath, isStandaloneApp } from "@schematics/angular/utility/ng-ast-utils";

export default function (options: Schema): Rule {
    return async (host: Tree, context: SchematicContext) => {
        const workspace = await getWorkspace(host);
        const project = getProjectFromWorkspace(workspace, options.project);

        if (project.extensions["projectType"] !== ProjectType.Application) {
            context.logger.warn(
                `project '${options.project}' is not an angular application. it look like angular library`,
            );
            return;
        }
        return chain([addAngularToaster(options), insertCSSDependency(options)])
    };
}

function addAngularToaster(options: Schema) {
    return async (host: Tree, context: SchematicContext) => {
        const workspace = await getWorkspace(host);
        const project = getProjectFromWorkspace(workspace, options.project);
        const mainFilePath = getProjectMainFile(project);
        console.log('isStandaloneApp(host, mainFilePath', isStandaloneApp(host, mainFilePath));
        if (isStandaloneApp(host, mainFilePath)) {
            context.logger.warn(
                `project '${options.project}' is an angular standalone application. angular toaster will support standalone mode.`,
            );
        } else {
            addAngularToasterToNoStandaloneApp(host, project, mainFilePath, context);
        }

        return;
    };
}

function addAngularToasterToNoStandaloneApp(host: Tree, project: ProjectDefinition, mainFile: string, context: SchematicContext) {
    const angularToasterModulue = "ToasterModule";
    const libName = "angular-toaster";
    const appModulePath = getAppModulePath(host, mainFile);
    if (hasNgModuleImport(host, appModulePath, angularToasterModulue)) {
        context.logger.error(
          `Could not set up "${angularToasterModulue}" ` +
            `because "${angularToasterModulue}" is already imported.`,
        );
        context.logger.info(`Please manually set up browser animations.`);
      } else {
        addModuleImportToRootModule(
          host,
          `${angularToasterModulue}.forRoot()`,
          libName,
          project,
        );
      }
}

function insertCSSDependency(options: Schema): Rule {
    const themePath = './node_modules/angular-toaster/toaster.css';
    
    return chain([
      addThemeStyleToTarget(options.project, 'build', themePath),
      addThemeStyleToTarget(options.project, 'test', themePath),
    ]);
  }
  
  function addThemeStyleToTarget(projectName: string, targetName: 'test' | 'build', assetPath: string): Rule {
    return updateWorkspace(workspace => {
      // TODO: Types have separate declarations of a private property '_validateNam
      const project = getProjectFromWorkspace(workspace as any, projectName);
      
      const targetOptions = getProjectTargetOptions(project, targetName);
      const styles = targetOptions!['styles'] as (string | { input: string })[];
  
      const existingStyles = styles.map(s => (typeof s === 'string' ? s : s.input));
  
      for (let [, stylePath] of existingStyles.entries()) {
        if (stylePath === assetPath)
          return;
      }
  
      styles.push(assetPath);
    });
  }