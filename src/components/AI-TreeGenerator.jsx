// src/AI-TreeGenerator.jsx
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import { GetAIGeneartedTree } from "@/api/GetAIGeneartedTree";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const GeminiPromptBox = ({ onJsonGenerated }) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Enter something first!");
      return;
    }

    setLoading(true);
    try {
      const res = await GetAIGeneartedTree(prompt);
      onJsonGenerated(JSON.stringify(res, null, 2));
      toast.success("✨ AI-generated JSON ready!");
    } catch (error) {
      toast.error(`Failed to generate JSON: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-md hover:opacity-90">
          Generate With AI 👑
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px]  border border-border rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Generate JSON Structure
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Describe what kind of JSON data you want to generate using AI.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <Textarea
            placeholder="Example: A company with departments, employees, and roles"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-muted/50 text-foreground border border-border focus:ring-2 focus:ring-primary/40 resize-none h-32 rounded-xl px-3 py-2 font-mono text-sm"
          />
        </div>

        <DialogFooter className="flex justify-end gap-3 mt-4">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-muted/70"
            >
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-md hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate JSON 🌟"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GeminiPromptBox;
