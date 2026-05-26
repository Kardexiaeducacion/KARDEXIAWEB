"use client";

import { useState } from "react";
import { useAppContext, EducationalMaterial } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Folder, FileText, Link as LinkIcon, Plus, Trash2, ExternalLink, Image as ImageIcon, Video, Book, FileArchive, Pencil } from "lucide-react";

export default function MaterialDidactico() {
  const { groups, activeGroupId, updateGroup, educationalMaterials, addEducationalMaterial, deleteEducationalMaterial } = useAppContext();
  const activeGroup = groups.find(g => g.id === activeGroupId);
  
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"file" | "link">("file");
  
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    subjectId: "",
    url: ""
  });
  const [fileToUpload, setFileToUpload] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  // Folder states
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [editFolderId, setEditFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");

  if (!activeGroup) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Folder className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">No hay grupos creados</h2>
        <p className="text-slate-500 mt-2">Crea un grupo primero en la sección de Grupos para poder gestionar su material didáctico.</p>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    // For simplicity, we store as Base64. In a real app, upload to S3/Cloud
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      setFileToUpload(event.target?.result as string);
    };
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.title) return;
    if (uploadType === "file" && !fileToUpload) {
      alert("Por favor selecciona un archivo.");
      return;
    }
    if (uploadType === "link" && !newMaterial.url) {
      alert("Por favor ingresa un enlace.");
      return;
    }

    addEducationalMaterial({
      groupId: activeGroupId,
      subjectId: activeFolderId || newMaterial.subjectId || undefined,
      title: newMaterial.title,
      description: newMaterial.description,
      type: uploadType,
      fileData: uploadType === "file" ? (fileToUpload as string) : undefined,
      fileName: uploadType === "file" ? fileName : undefined,
      url: uploadType === "link" ? newMaterial.url : undefined,
      uploadDate: new Date().toISOString()
    });

    setIsAddOpen(false);
    setNewMaterial({ title: "", description: "", subjectId: "", url: "" });
    setFileToUpload(null);
    setFileName("");
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !activeGroupId) return;
    
    const newSubject = { id: `subj_${Date.now()}`, name: newFolderName.trim() };
    const currentSubjects = activeGroup?.subjects || [];
    updateGroup(activeGroupId, { subjects: [...currentSubjects, newSubject] });
    
    setNewFolderName("");
    setIsNewFolderOpen(false);
    setActiveFolderId(newSubject.id);
  };

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    if (!activeGroupId) return;
    if (confirm(`¿Estás seguro de eliminar la carpeta "${folderName}"? Todos los materiales dentro de ella también se eliminarán.`)) {
      const currentSubjects = activeGroup?.subjects || [];
      updateGroup(activeGroupId, { subjects: currentSubjects.filter(s => s.id !== folderId) });
      
      // Delete materials in folder
      const materialsInFolder = educationalMaterials.filter(m => m.groupId === activeGroupId && m.subjectId === folderId);
      materialsInFolder.forEach(m => deleteEducationalMaterial(m.id));
      
      if (activeFolderId === folderId) setActiveFolderId(null);
    }
  };

  const handleEditFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFolderName.trim() || !activeGroupId || !editFolderId) return;
    
    const currentSubjects = activeGroup?.subjects || [];
    updateGroup(activeGroupId, { 
      subjects: currentSubjects.map(s => s.id === editFolderId ? { ...s, name: editFolderName.trim() } : s)
    });
    
    setIsEditFolderOpen(false);
  };

  // Get active materials depending on folder view
  const currentMaterials = educationalMaterials.filter(m => 
    m.groupId === activeGroupId && 
    (activeFolderId ? m.subjectId === activeFolderId : !m.subjectId)
  );

  const getFileIcon = (material: EducationalMaterial) => {
    if (material.type === "link") return <LinkIcon className="h-8 w-8 text-indigo-500" />;
    if (!material.fileName) return <FileText className="h-8 w-8 text-slate-500" />;
    
    const ext = material.fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) return <Book className="h-8 w-8 text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <ImageIcon className="h-8 w-8 text-blue-500" />;
    if (['mp4', 'mov', 'avi'].includes(ext || '')) return <Video className="h-8 w-8 text-purple-500" />;
    if (['zip', 'rar'].includes(ext || '')) return <FileArchive className="h-8 w-8 text-amber-500" />;
    return <FileText className="h-8 w-8 text-slate-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Contenido Didáctico</h2>
          <p className="text-slate-500 text-sm mt-1">Gestor de recursos y archivos por materia</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" /> Subir Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Subir Nuevo Material</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateMaterial} className="space-y-4 pt-4">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button 
                  type="button"
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${uploadType === 'file' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setUploadType('file')}
                >
                  Subir Archivo
                </button>
                <button 
                  type="button"
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${uploadType === 'link' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setUploadType('link')}
                >
                  Enlace Externo
                </button>
              </div>

              <div className="space-y-2">
                <Label>Título del Recurso</Label>
                <Input required placeholder="Ej. Diapositivas de Historia" value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} />
              </div>

              {(!activeFolderId) && (activeGroup?.subjects?.length || 0) > 0 && (
                <div className="space-y-2">
                  <Label>Materia (Carpeta)</Label>
                  <Select value={newMaterial.subjectId} onValueChange={(v) => setNewMaterial({...newMaterial, subjectId: v})}>
                    <SelectTrigger><SelectValue placeholder="General (Sin Carpeta)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General (Sin Carpeta)</SelectItem>
                      {(activeGroup?.subjects || []).map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {uploadType === "file" ? (
                <div className="space-y-2">
                  <Label>Archivo</Label>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors">
                    <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                      <Folder className="h-8 w-8 text-indigo-300 mb-2" />
                      <span className="text-sm font-medium text-slate-600">{fileName || "Click para buscar archivo"}</span>
                      <span className="text-xs text-slate-400 mt-1">PDF, Imágenes, Documentos, ZIP</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>URL (Drive, YouTube, etc.)</Label>
                  <Input type="url" required placeholder="https://..." value={newMaterial.url} onChange={e => setNewMaterial({...newMaterial, url: e.target.value})} />
                </div>
              )}

              <div className="space-y-2">
                <Label>Descripción (Opcional)</Label>
                <Textarea placeholder="Breve descripción del material..." value={newMaterial.description} onChange={e => setNewMaterial({...newMaterial, description: e.target.value})} />
              </div>
              
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Guardar Material</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Carpetas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 mb-3">
            <h3 className="font-semibold text-slate-700">Carpetas (Materias)</h3>
            <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Nueva Carpeta</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateFolder} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Nombre de la Carpeta</Label>
                    <Input required placeholder="Ej. Matemáticas" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Crear Carpeta</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col gap-1">
            <button 
              className={`flex items-center text-left px-3 py-2 rounded-lg transition-colors ${activeFolderId === null ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
              onClick={() => setActiveFolderId(null)}
            >
              <Folder className={`h-4 w-4 mr-2 ${activeFolderId === null ? 'fill-indigo-200 text-indigo-700' : 'text-slate-400'}`} />
              General
            </button>
            {(activeGroup?.subjects || []).map(subject => (
              <div key={subject.id} className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${activeFolderId === subject.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}>
                <button 
                  className="flex items-center flex-1 text-left truncate"
                  onClick={() => setActiveFolderId(subject.id)}
                >
                  <Folder className={`h-4 w-4 mr-2 shrink-0 ${activeFolderId === subject.id ? 'fill-indigo-200 text-indigo-700' : 'text-slate-400'}`} />
                  <span className="truncate">{subject.name}</span>
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => { setEditFolderId(subject.id); setEditFolderName(subject.name); setIsEditFolderOpen(true); }} className="p-1 text-slate-400 hover:text-indigo-600" title="Renombrar">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => handleDeleteFolder(subject.id, subject.name)} className="p-1 text-slate-400 hover:text-red-600" title="Eliminar">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explorador de Archivos */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 min-h-[400px]">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
              <Folder className="h-5 w-5 fill-indigo-100 text-indigo-500" />
              {activeFolderId ? activeGroup?.subjects?.find(s => s.id === activeFolderId)?.name || 'Carpeta' : 'Archivos Generales'}
            </h3>

            {currentMaterials.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentMaterials.map(material => (
                  <Card key={material.id} className="border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group overflow-hidden">
                    <CardContent className="p-4 flex flex-col items-center text-center relative h-full">
                      <button 
                        onClick={() => deleteEducationalMaterial(material.id)}
                        className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar material"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="mb-3 p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                        {getFileIcon(material)}
                      </div>
                      
                      <h4 className="font-semibold text-sm text-slate-800 line-clamp-2 w-full mb-1" title={material.title}>
                        {material.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mb-3 w-full line-clamp-1">
                        {new Date(material.uploadDate).toLocaleDateString()}
                      </p>

                      <div className="mt-auto pt-2 w-full">
                        {material.type === "link" ? (
                          <a 
                            href={material.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full py-1.5 px-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded hover:bg-indigo-100 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" /> Abrir Enlace
                          </a>
                        ) : (
                          <a 
                            href={material.fileData} 
                            download={material.fileName}
                            className="flex items-center justify-center w-full py-1.5 px-2 bg-slate-100 text-slate-700 text-xs font-bold rounded hover:bg-slate-200 transition-colors"
                          >
                            <FileText className="h-3 w-3 mr-1" /> Descargar
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Folder className="h-16 w-16 text-slate-200 mb-4" />
                <h4 className="text-lg font-medium text-slate-600">Carpeta vacía</h4>
                <p className="text-sm text-slate-400 mt-1 max-w-sm">
                  No hay materiales en esta sección. Puedes subir archivos o guardar enlaces externos usando el botón "Subir Material".
                </p>
                <Button variant="outline" className="mt-6 border-indigo-200 text-indigo-600 hover:bg-indigo-50" onClick={() => setIsAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Agregar Ahora
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isEditFolderOpen} onOpenChange={setIsEditFolderOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Renombrar Carpeta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditFolder} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nuevo Nombre</Label>
              <Input required placeholder="Ej. Matemáticas" value={editFolderName} onChange={e => setEditFolderName(e.target.value)} />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Guardar Cambios</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
