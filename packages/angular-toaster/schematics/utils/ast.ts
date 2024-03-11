import { SchematicsException, Tree } from '@angular-devkit/schematics';
import * as ts from "@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript";
import { ProjectDefinition } from '@schematics/angular/utility';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';
import { getProjectMainFile } from './project';
import { InsertChange } from '@schematics/angular/utility/change';

/** Reads file given path and returns TypeScript source file. */
export function parseSourceFile(host: Tree, path: string): ts.SourceFile {
    const buffer = host.read(path);
    if (!buffer) {
        throw new SchematicsException(`Could not find file for path: ${path}`);
    }
    return ts.createSourceFile(path, buffer.toString(), ts.ScriptTarget.Latest, true);
}

/** Import and add module to root app module. */
export function addModuleImportToRootModule(
    host: Tree,
    moduleName: string,
    src: string,
    project: ProjectDefinition,
) {
    const modulePath = getAppModulePath(host, getProjectMainFile(project));
    addModuleImportToModule(host, modulePath, moduleName, src);
}

/**
* Import and add module to specific module path.
* @param host the tree we are updating
* @param modulePath src location of the module to import
* @param moduleName name of module to import
* @param src src location to import
*/
export function addModuleImportToModule(
    host: Tree,
    modulePath: string,
    moduleName: string,
    src: string,
) {
    const moduleSource = parseSourceFile(host, modulePath);

    if (!moduleSource) {
        throw new SchematicsException(`Module not found: ${modulePath}`);
    }

    const changes = addImportToModule(moduleSource, modulePath, moduleName, src);
    const recorder = host.beginUpdate(modulePath);

    changes.forEach(change => {
        if (change instanceof InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
        }
    });

    host.commitUpdate(recorder);
}