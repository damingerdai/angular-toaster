import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { Schema } from './schema';

export default function (options: Schema): Rule {
  return async (_host: Tree, _context: SchematicContext) => {
    const installTaskId = _context.addTask(new NodePackageInstallTask());
    _context.addTask(
      new RunSchematicTask("ng-add-setup-project", options), 
      [
        installTaskId,
      ]);
    _context.logger.log("info", '✅️ Added "ngx-apexcharts"');
  };
}
