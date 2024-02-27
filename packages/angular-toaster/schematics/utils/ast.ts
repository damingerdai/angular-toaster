import { SchematicsException, Tree } from '@angular-devkit/schematics';
import * as ts from "@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript";

/** Reads file given path and returns TypeScript source file. */
export function parseSourceFile(host: Tree, path: string): ts.SourceFile {
    const buffer = host.read(path);
    if (!buffer) {
        throw new SchematicsException(`Could not find file for path: ${path}`);
    }
    return ts.createSourceFile(path, buffer.toString(), ts.ScriptTarget.Latest, true);
}