#r "Newtonsoft.Json"

using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using Newtonsoft.Json;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
{
    try {
        // Read request body
        var content = await req.Content.ReadAsStringAsync();
        dynamic data = JsonConvert.DeserializeObject(content);
        
        // Get file data
        byte[] fileBytes = Convert.FromBase64String((string)data.file);
        string format = data.format ?? "docx";
        string fileName = data.filename ?? "document.pdf";
        
        // Create temp directory
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(tempDir);
        var pdfPath = Path.Combine(tempDir, fileName);
        
        // Save PDF
        File.WriteAllBytes(pdfPath, fileBytes);
        
        // Convert using LibreOffice
        var process = new Process() {
            StartInfo = new ProcessStartInfo {
                FileName = "/usr/bin/libreoffice",
                Arguments = $"--headless --convert-to {format} --outdir {tempDir} {pdfPath}",
                RedirectStandardOutput = true,
                CreateNoWindow = true
            }
        };
        
        process.Start();
        await process.WaitForExitAsync();
        
        // Get converted file
        var outputName = Path.GetFileNameWithoutExtension(fileName) + $".{format}";
        var outputPath = Path.Combine(tempDir, outputName);
        
        var result = new HttpResponseMessage(HttpStatusCode.OK) {
            Content = new ByteArrayContent(File.ReadAllBytes(outputPath))
        };
        
        result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment") {
            FileName = outputName
        };
        
        result.Content.Headers.ContentType = new MediaTypeHeaderValue(
            format == "docx" 
                ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                : "application/msword");
        
        return result;
    }
    catch (Exception ex) {
        return new HttpResponseMessage(HttpStatusCode.InternalServerError) {
            Content = new StringContent($"Conversion failed: {ex.Message}")
        };
    }
    finally {
        // Clean up temp directory
        if (Directory.Exists(tempDir)) {
            Directory.Delete(tempDir, true);
        }
    }
}
