import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Schema as ApplicationOptions, Style } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { Schema as AngularToasterOptions } from './schema';

describe('angular toaster schematic unit test', () => {
    const schematicRunner = new SchematicTestRunner('angular-toaster', path.join(__dirname, '../collection.json'));
    const defaultOptions: AngularToasterOptions = {
        project: 'angular-toaster-app',
    };

    const workspaceOptions: WorkspaceOptions = {
        name: 'workspace',
        newProjectRoot: 'projects',
        version: '0.0.1'
    };
    const appOptions: ApplicationOptions = {
        name: 'angular-toaster-app',
        inlineStyle: false,
        inlineTemplate: false,
        routing: false,
        style: Style.Scss,
        skipTests: false,
        skipPackageJson: false,
        standalone: false
    };
    let appTree: UnitTestTree | undefined;

    beforeEach(async () => {
        appTree = await schematicRunner.runExternalSchematic('@schematics/angular', 'workspace', workspaceOptions);
        appTree = await schematicRunner.runExternalSchematic('@schematics/angular', 'application', appOptions, appTree);
        const standaloneAppOptions = { ...appOptions, name: 'angular-toaster-standalone-app', standalone: true };
        appTree = await schematicRunner.runExternalSchematic(
            '@schematics/angular',
            'application',
            standaloneAppOptions,
            appTree
        );
    });

    describe('when project is not a standalone application', () => {
        it('should update app module', async () => {
            const options = { ...defaultOptions };
            const tree = await schematicRunner.runSchematic('ng-add-setup-project', options, appTree);
            const content = tree.readContent('/projects/angular-toaster-app/src/app/app.module.ts');
            expect(content)
                .withContext('Expected the ToasterModule to be imported.')
                .toMatch(/import\s+{\s*ToasterModule\s*}\s+from\s+'angular-toaster'/);
            expect(content)
                .withContext('Expected the ToasterModule to be added to the imports array.')
                .toMatch(/imports:\s*\[[^\]]+?,\r?\n\s+ToasterModule\.forRoot\(\)\r?\n/m,);
        });

        it('should update angular styles', async () => {
            const options = { ...defaultOptions };
            const tree = await schematicRunner.runSchematic('ng-add-setup-project', options, appTree);
            const angularJsonContent = tree.readContent('/angular.json');
            const angularJson = JSON.parse(angularJsonContent);
            const angularToasterApp = angularJson.projects['angular-toaster-app'];
            const architect = angularToasterApp.architect;
            const buildArchitect = architect.build;
            const testArchitect = architect.test;

            expect(buildArchitect.options.styles).withContext('Expect the theme css import styles').toContain('./node_modules/angular-toaster/toaster.css');
            expect(testArchitect.options.styles).withContext('Expect the theme css import styles').toContain('./node_modules/angular-toaster/toaster.css');
        });
    });


    describe('when project is a standalone application', () => {
        it('should update app config', async () => {
            const options = { ...defaultOptions, project: 'angular-toaster-standalone-app' };
            const tree = await schematicRunner.runSchematic('ng-add-setup-project', options, appTree);
            const content = tree.readContent('/projects/angular-toaster-standalone-app/src/app/app.config.ts');
            expect(content)
                .withContext('Expected the provideAngularToaster to be imported.')
                .toMatch(/import\s+{\s*provideAngularToaster\s*}\s+from\s+'angular-toaster'/);
            expect(content)
                .withContext('Expected the provideAngularToaster to be added to the providers array.')
                .toMatch(/providers:\s*\[\s*.*?provideAngularToaster\(\)/);
        });

        it('should update angular styles', async () => {
            const options = { ...defaultOptions, project: 'angular-toaster-standalone-app' };
            const tree = await schematicRunner.runSchematic('ng-add-setup-project', options, appTree);
            const angularJsonContent = tree.readContent('/angular.json');
            const angularJson = JSON.parse(angularJsonContent);
            const angularToasterApp = angularJson.projects['angular-toaster-standalone-app'];
            const architect = angularToasterApp.architect;
            const buildArchitect = architect.build;
            const testArchitect = architect.test;

            expect(buildArchitect.options.styles).withContext('Expect the theme css import styles').toContain('./node_modules/angular-toaster/toaster.css');
            expect(testArchitect.options.styles).withContext('Expect the theme css import styles').toContain('./node_modules/angular-toaster/toaster.css');
        });
    });
});
