"use client"

import { 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Share2, 
  Copy, 
  Eye,
  Type,
  Sparkles
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { toast } from 'sonner';
import axios from 'axios';

import { useRouter } from 'next/navigation';

interface ContentActionsProps {
  id: string;
  type: 'movie' | 'series';
  title: string;
  slug: string;
}

export function ContentActions({ id, type, title, slug }: ContentActionsProps) {
  const router = useRouter();
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showRenameConfirm, setShowRenameConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAIAnalyze = async () => {
    setIsAnalyzing(true);
    toast.info(`AI is analyzing "${title}" for exciting scenes...`);
    
    try {
      await axios.post('/api/admin/ai/analyze', {
        contentId: id,
        type: type === 'movie' ? 'movie' : 'episode' // For now assuming it's a movie or we'd need to handle series differently
      });
      toast.success(`AI Analysis complete for ${title}!`);
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      toast.error(`AI Analysis failed: ${message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEdit = () => {
    router.push(`/admin/content/edit/${type}/${id}`);
  };

  const handleRename = () => {
    const nextTitle = window.prompt('New title', title);
    if (!nextTitle) return;
    const trimmed = nextTitle.trim();
    if (!trimmed || trimmed === title) return;

    axios
      .patch('/api/admin/content', { id, type, title: trimmed })
      .then(() => {
        toast.success('Renamed');
        router.refresh();
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Rename failed';
        toast.error(`Rename failed: ${message}`);
      });
  };

  const handleViewDetails = () => {
    router.push(`/${type === 'movie' ? 'movies' : 'series'}/${slug}`);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${type === 'movie' ? 'movies' : 'series'}/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success('ID copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/admin/content?id=${id}&type=${type}`);
      toast.success(`${title} deleted successfully.`);
      // router.refresh() sometimes isn't enough in complex caching scenarios
      setTimeout(() => {
        router.refresh();
      }, 100);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Delete failed';
      toast.error(`Delete failed: ${message}`);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white transition-colors">
            <MoreVertical className="w-5 h-5" />
          </Button>
        } />
        <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800 text-zinc-300">
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer" onClick={handleViewDetails}>
            <Eye className="mr-2 h-4 w-4" />
            <span>View Details</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-zinc-800 focus:text-white cursor-pointer"
            onClick={() => setShowEditConfirm(true)}
          >
            <Edit2 className="mr-2 h-4 w-4" />
            <span>Edit Content</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-zinc-800 focus:text-white cursor-pointer"
            onClick={() => setShowRenameConfirm(true)}
          >
            <Type className="mr-2 h-4 w-4" />
            <span>Rename</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-zinc-800 focus:text-white cursor-pointer"
            onClick={handleAIAnalyze}
            disabled={isAnalyzing}
          >
            <Sparkles className={`mr-2 h-4 w-4 text-red-500 ${isAnalyzing ? "animate-pulse" : ""}`} />
            <span>AI Analyze Scenes</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            <span>Share</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer" onClick={handleCopyId}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy ID</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem 
            variant="destructive" 
            className="focus:bg-red-500/10 focus:text-red-500 cursor-pointer"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        open={showEditConfirm}
        onOpenChange={setShowEditConfirm}
        title="Edit Content?"
        description={`Are you sure you want to open the editor for "${title}"? Any unsaved changes in your current view might be lost.`}
        onConfirm={handleEdit}
        confirmText="Open Editor"
      />

      <ConfirmationDialog
        open={showRenameConfirm}
        onOpenChange={setShowRenameConfirm}
        title="Rename Content?"
        description={`Do you want to rename "${title}"? This will update the display name across the entire platform.`}
        onConfirm={handleRename}
        confirmText="Rename"
      />

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Forever?"
        description={`This action is permanent! Are you sure you want to delete "${title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        confirmText="Delete Now"
        variant="destructive"
      />
    </>
  );
}
