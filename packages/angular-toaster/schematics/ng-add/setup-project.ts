import { chain, Rule, Tree, SchematicContext } from '@angular-devkit/schematics';
import { getWorkspace, ProjectDefinition } from '@schematics/angular/utility/workspace';
import { ProjectType } from '@schematics/angular/utility/workspace-models';
import { addModuleImportToRootModule, getProjectFromWorkspace, getProjectMainFile, hasNgModuleImport } from '../utils';
import { Schema } from './schema';
import { getAppModulePath, isStandaloneApp } from '@schematics/angular/utility/ng-ast-utils';
import { addThemeToAppStyles } from './theming/theming';

export default function (options: Schema): Rule {
  return async (host: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);

    if (project.extensions['projectType'] !== ProjectType.Application) {
      context.logger.warn(
        `project '${options.project}' is not an angular application. it look like angular library`,
      );
      return;
    }
    return chain([addAngularToaster(options), addThemeToAppStyles(options)])
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
  const angularToasterModulue = 'ToasterModule';
  const libName = 'angular-toaster';
  const appModulePath = getAppModulePath(host, mainFile);
  if (hasNgModuleImport(host, appModulePath, angularToasterModulue)) {
    context.logger.error(
      `Could not set up '${angularToasterModulue}' ` +
      `because '${angularToasterModulue}' is already imported.`,
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
