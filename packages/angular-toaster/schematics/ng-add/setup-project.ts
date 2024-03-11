import { chain, Rule, Tree, SchematicContext } from '@angular-devkit/schematics';
import { getAppModulePath, isStandaloneApp } from '@schematics/angular/utility/ng-ast-utils';
import { addRootProvider } from '@schematics/angular/utility';
import { ProjectType } from '@schematics/angular/utility/workspace-models';
import { ProjectDefinition, getWorkspace } from '@schematics/angular/utility/workspace';
import { Schema } from './schema';
import { addThemeToAppStyles } from './theming';
import { addModuleImportToRootModule } from '../utils/ast';
import { getProjectFromWorkspace, getProjectMainFile } from '../utils/project';
import { hasNgModuleImport } from '../utils/ng-module-imports';



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
  return async (host: Tree) => {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);
    const mainFilePath = getProjectMainFile(project);
    if (isStandaloneApp(host, mainFilePath)) {
      return addAngularToasterToStandaloneApp(options.project);
    } else {
      return addAngularToasterToNoStandaloneApp(project, mainFilePath);
    }
  };
}

function addAngularToasterToNoStandaloneApp(project: ProjectDefinition, mainFile: string,) {
  return (host: Tree, context: SchematicContext) => {
    const angularToasterModulue = 'ToasterModule';
    const angularToasterModulueForRoot = `${angularToasterModulue}.forRoot()`
    const libName = 'angular-toaster';
    const appModulePath = getAppModulePath(host, mainFile);
    if (hasNgModuleImport(host, appModulePath, angularToasterModulue)) {
      context.logger.warn(
        `Could not set up "${angularToasterModulue}" ` +
        `because "${angularToasterModulue}" is already imported.`,
      );
    }
    addModuleImportToRootModule(
      host,
      angularToasterModulueForRoot,
      libName,
      project,
    );

    return host;
  }
}

function addAngularToasterToStandaloneApp(project: string): Rule {
  return () => {
    const providerFn = 'provideAngularToaster';
    const libName = 'angular-toaster';

    return addRootProvider(project, ({ code, external }) => {
      return code`${external(providerFn, libName)}()`;
    });
  }

}
