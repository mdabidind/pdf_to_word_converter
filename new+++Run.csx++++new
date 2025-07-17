// Run.csx
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
        var provider = new MultipartMemoryStreamProvider();
        await req.Content.ReadAsMultipartAsync(provider);
        
        var file = provider.Contents.First();
        var fileName = file.Headers.ContentDisposition.FileName.Trim('\"');
        var fileBytes = await file.ReadAsByteArrayAsync();
        
        // Save to temp file
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(tempDir);
        var pdfPath = Path.Combine(tempDir, fileName);
        File.WriteAllBytes(pdfPath, fileBytes);
        
        // Convert using LibreOffice
        var format = req.GetQueryNameValuePairs()
            .FirstOrDefault(q => q.Key == "format").Value ?? "docx";
            
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
        var outputFile = Path.Combine(tempDir, Path.GetFileNameWithoutExtension(fileName) + $".{format}");
        var result = new HttpResponseMessage(HttpStatusCode.OK) {
            Content = new ByteArrayContent(File.ReadAllBytes(outputFile))
        };
        result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment") {
            FileName = $"converted.{format}"
        };
        result.Content.Headers.ContentType = new MediaTypeHeaderValue("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        
        // Clean up
        Directory.Delete(tempDir, true);
        
        return result;
    }
    catch (Exception ex) {
        return new HttpResponseMessage(HttpStatusCode.InternalServerError) {
            Content = new StringContent($"Conversion failed: {ex.Message}")
        };
    }
}
