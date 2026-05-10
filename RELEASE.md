# StudyFlow Release Install

This release bundle is the easiest way to run StudyFlow without cloning the repository.

## Windows PowerShell

After downloading `studyflow.zip`, run:

```powershell
Expand-Archive .\studyflow.zip -DestinationPath .\studyflow -Force
cd .\studyflow
npm install --omit=dev
npm start
```

Then open:

```text
http://localhost:3001
```

You can also double-click:

```text
Start StudyFlow Release.bat
```

## One-Line GitHub Release Install

After you upload the zip to GitHub Releases, people can install it from PowerShell with:

```powershell
$url="https://github.com/YOUR-USER/YOUR-REPO/releases/latest/download/studyflow.zip"; iwr $url -OutFile studyflow.zip; Expand-Archive .\studyflow.zip -DestinationPath .\studyflow -Force; cd .\studyflow; npm install --omit=dev; npm start
```

Replace `YOUR-USER/YOUR-REPO` with the real GitHub repository path.

## One-Line macOS Or Linux Install

```bash
curl -L -o studyflow.zip https://github.com/YOUR-USER/YOUR-REPO/releases/latest/download/studyflow.zip && unzip -o studyflow.zip -d studyflow && cd studyflow && npm install --omit=dev && npm start
```

## Create The Zip

From the project folder:

```bash
npm run release
```

This creates:

```text
release/studyflow.zip
```

Upload that zip file to a GitHub Release. The zip includes the built frontend, local API server, install metadata, README, and release launcher.
