
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
} from "@/components/ui/dialog"

const GeminiPromptBox = ({ onJsonGenerated }) => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        console.log(prompt);
        if (!prompt.trim()) {
            toast.error("Enter something first!");
            return;
        }

        setLoading(true);

        try {

            const res = await GetAIGeneartedTree(prompt);

            console.log(res);

            onJsonGenerated(JSON.stringify(res, null, 2));

        } catch (error) {
            toast.error(`Failed to generate JSON ${error}`);
        }
        finally {
            setLoading(false);
        }
    }
    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>Generate With AI ⭐</Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[550px] bg-[#0b0b0b] text-white border border-gray-700 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-white">
                            Generate JSON Structure
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Describe what kind of JSON data you want generated.
                        </DialogDescription>
                    </DialogHeader>

                    {/* ✅ Main Content Section */}
                    <div className="flex flex-col gap-4 mt-4">
                        <Textarea
                            placeholder="Describe the data you want (e.g., A user with name, email, and address)"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="bg-black text-white border border-gray-700 focus:border-[#B6995A] focus:ring-0 resize-none h-32 rounded-xl px-3 py-2"
                        />
                    </div>

                    {/* ✅ Proper Footer for Actions */}
                    <DialogFooter className="flex justify-end gap-3 mt-4">
                        <DialogClose asChild>
                            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                                Cancel
                            </Button>
                        </DialogClose>


                        <DialogClose asChild>
                            <Button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="bg-gradient-to-r from-[#B6995A] to-[#8C7A4E] text-white font-medium hover:opacity-90"
                            >
                                {loading ? "Generating..." : "Generate JSON 🌟"}
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </>
    )
}

export default GeminiPromptBox;