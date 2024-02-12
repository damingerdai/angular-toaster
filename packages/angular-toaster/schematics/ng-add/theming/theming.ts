import { chain, Rule, Tree, SchematicContext } from '@angular-devkit/schematics';
import { updateWorkspace } from '@schematics/angular/utility/workspace';
import { Schema } from '../schema';
import { getProjectFromWorkspace, getProjectTargetOptions } from '../../utils';


export function addThemeToAppStyles(options: Schema): Rule {
  const themePath = './node_modules/angular-toaster/toaster.css';

  // eslint-disable-next-line no-unused-vars
  return (_host: Tree, _context: SchematicContext) => {
    return chain([
      addThemeStyleToTarget(options.project, 'build', themePath),
      addThemeStyleToTarget(options.project, 'test', themePath),
    ]);
  }
}

function addThemeStyleToTarget(projectName: string, targetName: 'test' | 'build', assetPath: string): Rule {
  return updateWorkspace(workspace => {
    // TODO: Types have separate declarations of a private property '_validateNam
    const project = getProjectFromWorkspace(workspace as any, projectName);

     // Do not update the builder options in case the target does not use the default CLI builder.
    // if (!validateDefaultTargetBuilder(project, targetName, logger)) {
    //   return
    // }

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