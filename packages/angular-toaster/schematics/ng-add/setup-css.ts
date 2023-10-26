import { chain, Rule } from '@angular-devkit/schematics';
import { getProjectFromWorkspace } from '@angular/cdk/schematics';
import { getProjectTargetOptions } from '@angular/cdk/schematics';
import { updateWorkspace } from '@schematics/angular/utility/workspace';
import { Schema } from './schema';

const themePath = `angular-toaster/toaster.css`;

export default function(options: Schema): Rule {
  return async () => {
    return chain([
      insertCSSDependency(options)
    ]);
  };
}

function insertCSSDependency(options: Schema): Rule {
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
    const styles = targetOptions['styles'] as (string | { input: string })[];

    const existingStyles = styles.map(s => (typeof s === 'string' ? s : s.input));

    for (let [, stylePath] of existingStyles.entries()) {
      if (stylePath === assetPath)
        return;
    }

    styles.unshift(assetPath);
  });
}
