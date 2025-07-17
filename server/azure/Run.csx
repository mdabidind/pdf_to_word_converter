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
        // Read and parse request body
        string requestBody = await req.Content.ReadAsStringAsync();
        dynamic data = JsonConvert.DeserializeObject(requestBody);
        
        // Get parameters
        byte[] fileBytes = Convert.FromBase64String((string)data.file);
        string format = data.format ?? "docx";
        string fileName = data.filename ?? "document.pdf";
        
        // Create temp directory
        string tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(tempDir);
        string pdfPath = Path.Combine(tempDir, fileName);
        
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
        string outputName = Path.GetFileNameWithoutExtension(fileName) + $".{format}";
        string outputPath = Path.Combine(tempDir, outputName);
        byte[] outputBytes = File.ReadAllBytes(outputPath);
        string base64Output = Convert.ToBase64String(outputBytes);
        
        // Prepare response
        var response = new {
            file = base64Output,
            filename = outputName,
            format = format
        };
        
        return req.CreateResponse(HttpStatusCode.OK, response);
    }
    catch (Exception ex) {
        return req.CreateResponse(HttpStatusCode.InternalServerError, new {
            error = ex.Message
        });
    }
    finally {
        // Clean up temp directory
        if (Directory.Exists(tempDir)) {
            Directory.Delete(tempDir, true);
        }
    }
}
