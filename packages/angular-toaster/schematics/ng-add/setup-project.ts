import { chain, Rule, Tree, SchematicContext } from '@angular-devkit/schematics';
import { addSymbolToNgModuleMetadata, insertImport } from '@schematics/angular/utility/ast-utils';
import { getAppModulePath, isStandaloneApp } from '@schematics/angular/utility/ng-ast-utils';
import { addRootProvider } from '@schematics/angular/utility';
import { ProjectType } from '@schematics/angular/utility/workspace-models';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { Schema } from './schema';
import { addThemeToAppStyles } from './theming';
import { parseSourceFile } from '../utils/ast';
import { applyChangesToFile } from '../utils/change';
import { getProjectFromWorkspace, getProjectMainFile } from '../utils/project';



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
    if (project?.extensions['projectType'] === ProjectType.Application) {
      if (isStandaloneApp(host, mainFilePath)) {
        return addAngularToasterToStandaloneApp(options.project);
      } else {
        return addAngularToasterToNoStandaloneApp(mainFilePath);
      }
    }
    return;
  };
}

function addAngularToasterToNoStandaloneApp(mainFile: string) {
  return (host: Tree) => {
    const angularToasterModulue = 'ToasterModule';
    const libName = 'angular-toaster';
    const appModulePath = getAppModulePath(host, mainFile);
    const moduleSource = parseSourceFile(host, appModulePath);
    applyChangesToFile(host, appModulePath, [
      insertImport(moduleSource, appModulePath, angularToasterModulue, libName),
      ...addSymbolToNgModuleMetadata(moduleSource, appModulePath, 'imports', `${angularToasterModulue}.forRoot()`, null)
    ]);

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
