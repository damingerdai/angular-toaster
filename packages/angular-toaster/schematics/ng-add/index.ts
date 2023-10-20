import { workspaces } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';
import { ProjectDefinition, getWorkspace } from '@schematics/angular/utility/workspace';
import { SchematicsException } from '@angular-devkit/schematics';
import { addSymbolToNgModuleMetadata, insertImport } from '@schematics/angular/utility/ast-utils';
import { ProjectType } from '@schematics/angular/utility/workspace-models';
import { InsertChange } from '@schematics/angular/utility/change';
import { Schema } from './schema';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';

export default function(options: Schema): Rule {
  return async (_host: Tree, _context: SchematicContext) => {
    const workspace = await getWorkspace(_host);
    const projectName = options.project || workspace.extensions.defaultProject!.toString();
    const project = workspace.projects.get(projectName);
    if (!project) {
      throw new Error(`can not find ${projectName} angular project`);
    }
    if (project.extensions.projectType === ProjectType.Application) {
      addAngularToasterModule(project, _host);
    }
    const installTaskId = _context.addTask(new NodePackageInstallTask());
    _context.addTask(new RunSchematicTask('setup-css', options), [installTaskId]);
    _context.logger.log('info', '✅️ Added "angular-taoaster');
  }
}

function addAngularToasterModule(project: ProjectDefinition, _host: Tree): void {
  if (!project) {
    return;
  }

  const appModulePath = getAppModulePath(_host, getProjectMainFile(project));
  const sourceFile = readIntoSourceFile(_host, appModulePath);
  const importPath = 'angular-toaster';
  const recorder = _host.beginUpdate(appModulePath);
  const moduleName = 'ToasterModule';
  const importChange = insertImport(sourceFile, appModulePath, moduleName, importPath);
  if (importChange instanceof InsertChange) {
    recorder.insertLeft(importChange.pos, importChange.toAdd);
  }
  const ngModuleName = 'ToasterModule.forRoot()';
  const ngModuleChanges = addSymbolToNgModuleMetadata(sourceFile, appModulePath, 'imports', ngModuleName, null);
  for (const change of ngModuleChanges) {
    if (change instanceof InsertChange) {
      recorder.insertLeft(change.pos, change.toAdd);
    }
  }
  _host.commitUpdate(recorder);
}

function getProjectMainFile(project: ProjectDefinition): string {
  const buildOptions = getProjectTargetOptions(project, 'build');
  if (!buildOptions || !buildOptions.main) {
    throw new SchematicsException(
      `Could not find the project main file inside of the ` + `workspace config (${project.sourceRoot})`
    );
  }

  return buildOptions.main.toString();
}

function readIntoSourceFile(host: Tree, modulePath: string): ts.SourceFile {
  const text = host.read(modulePath);
  if (text === null) {
    throw new SchematicsException(`File ${modulePath} does noot exist`);
  }

  const sourceText = text.toString('utf-8');
  return ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
}

// eslint-disable-next-line
function getProjectTargetOptions(project: ProjectDefinition, buildTarget: string) {
  if (project?.targets?.get(buildTarget)?.options) {
    return project!.targets!.get(buildTarget)!.options;
  }

  throw new Error(`Cannot determine project target configuration for: ${buildTarget}.`);
}

