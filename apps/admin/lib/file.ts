import path from "path";

export async function downloadFile(
    url: string,
    filename?: string
): Promise<void> {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();

        // Extract filename from URL if not provided
        if (!filename) {
            const urlPath = new URL(url).pathname;
            filename = path.basename(urlPath) || 'downloaded_file';
        }

        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}