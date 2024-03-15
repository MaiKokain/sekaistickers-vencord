import { showNotification } from "@api/Notifications";
import { Button } from "@webpack/common";

export const VERSION = "1.0.0";

async function getVersion() {
    const repoVersion = await (await fetch("https://codeberg.org/maikokain/sekaistickers-vencord/raw/branch/main/VERSION", { cache: "no-cache" })).text();
    const repoVersionMatch = repoVersion.match(/(.)+/);
    if (!repoVersionMatch) return;

    const [_, version] = repoVersionMatch;
    const [major, minor, patch] = version.split(".").map(m => parseInt(m));
    if (Number.isNaN(major) || Number.isNaN(minor) || Number.isNaN(patch)) return false;

    const [currMajor, currMinor, currPatch] = VERSION.split(".").map(m => parseInt(m));

    if (major > currMajor || minor > currMinor || patch > currPatch) return repoVersion;

    return false;
}

export async function checkUpdate() {
    const updateVer = await getVersion();
    if (!updateVer) return;

    showNotification({
        title: `Update available for SekaiStickers: ${updateVer}`,
        body: "Update or knight Mafuyu Asahina comes to your house",
        permanent: false,
        noPersist: true,
    });
}

export function updateButton() {
    return (<Button onClick={() => checkUpdate()} label="Check for Updates" />);
}