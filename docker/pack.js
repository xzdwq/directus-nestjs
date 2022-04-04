const { execSync } = require('child_process');
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const path = require('path');

const lernaListResult = execSync('npx lerna list --json'); //The "proper" way to do this with --include-dependencies and --scope won't work here because it includes devDependencies!

const list = JSON.parse(String(lernaListResult));
const apiPackageJson = require(path.resolve(__dirname, '../api/package.json'));

const projectPackageJson = {
	name: 'directus-project',
	private: true,
	description: 'Directus Project',
	dependencies: apiPackageJson.optionalDependencies,
};

const directusPackage = list.find((list) => list.name === 'directus');

if (!existsSync('dist')) {
	mkdirSync('dist');
}

function addPackageRecursive(package) {
	const tarName = String(
		execSync(`npm pack ${package.location}`, { cwd: path.resolve(__dirname, '..', 'dist') })
	).trim();
	projectPackageJson.dependencies[package.name] = `file:${tarName}`;
	const packageJson = require(path.join(package.location, 'package.json'));
	Object.keys(packageJson.dependencies || {}).forEach((dependencyName) => {
		if (!projectPackageJson.dependencies[dependencyName]) {
			const package = list.find((list) => list.name === dependencyName);
			if (package) {
				addPackageRecursive(package);
			}
		}
	});
}

addPackageRecursive(directusPackage);

writeFileSync(path.resolve(__dirname, '../dist/package.json'), JSON.stringify(projectPackageJson, null, 4));
