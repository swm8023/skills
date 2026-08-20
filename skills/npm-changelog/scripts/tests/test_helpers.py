import json
import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = SKILL_ROOT
INSPECT = SKILL_ROOT / "scripts" / "inspect_npm_policy.py"
VALIDATE = SKILL_ROOT / "scripts" / "validate_changelog.py"


GO_SOURCE = textwrap.dedent(
    '''
    package tools

    const myFlickerPackageName = "@myflicker/cli"

    type npmPackagePolicy struct{}

    var runtimeNPMPackages = []npmPackagePolicy{
        {PackageName: "@scope/alpha", DisplayName: "Alpha", AgentTypes: []string{"alpha"}, Kind: "runtime"},
        {PackageName: myFlickerPackageName, DisplayName: "Flicker", AgentTypes: []string{"flicker"}, BinaryName: "myflicker", Kind: "runtime"},
    }

    var deprecatedNPMPackages = []npmPackagePolicy{
        {PackageName: "@scope/old", DisplayName: "Old", Kind: "deprecated"},
    }
    '''
)


def write_fixture_repo(root: Path) -> None:
    npm_go = root / "server" / "internal" / "hub" / "tools" / "npm.go"
    npm_go.parent.mkdir(parents=True)
    npm_go.write_text(GO_SOURCE, encoding="utf-8")


def run_helper(script: Path, repo_root: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, "-B", str(script), str(repo_root)],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=False,
    )


class HelperContractTests(unittest.TestCase):
    def test_inspect_extracts_runtime_packages_and_stable_filenames(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            write_fixture_repo(root)

            result = run_helper(INSPECT, root)

            self.assertEqual(result.returncode, 0, result.stderr)
            payload = json.loads(result.stdout)
            self.assertEqual(
                [item["packageName"] for item in payload["packages"]],
                ["@scope/alpha", "@myflicker/cli"],
            )
            self.assertEqual(
                [item["fileName"] for item in payload["packages"]],
                ["scope--alpha.md", "myflicker--cli.md"],
            )

    def test_validator_accepts_complete_files_and_rejects_duplicate_versions(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            write_fixture_repo(root)
            changelog = root / "docs" / "changelog"
            changelog.mkdir(parents=True)
            body = """# {package}\n\n## 1.2.0\n\n### Added\n\n- 新增。\n\n### WheelMaker integration\n\n- 无需动作。\n\n## 1.1.0\n\n### Fixed\n\n- 修复。\n\n### WheelMaker integration\n\n- 需回归验证。\n"""
            for package, file_name in (
                ("@scope/alpha", "scope--alpha.md"),
                ("@myflicker/cli", "myflicker--cli.md"),
            ):
                changelog.joinpath(file_name).write_text(body.format(package=package), encoding="utf-8")

            result = run_helper(VALIDATE, root)
            self.assertEqual(result.returncode, 0, result.stderr)

            duplicate = changelog / "scope--alpha.md"
            duplicate.write_text(
                duplicate.read_text(encoding="utf-8") + "\n## 1.2.0\n\n### WheelMaker integration\n\n- 重复。\n",
                encoding="utf-8",
            )
            result = run_helper(VALIDATE, root)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("duplicate", result.stderr.lower())


if __name__ == "__main__":
    unittest.main()
