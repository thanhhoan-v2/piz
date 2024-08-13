import {
	Button,
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	Textarea,
} from "@components/ui/common";
import { Avatar, AvatarFallback } from "@components/ui/common/avatar";
import { cn } from "@utils/cn";
import { HashIcon, ImageIcon, MenuIcon } from "lucide-react";
import React from "react";

export default function SideBarMobileDrawer({
	isOpen,
	setOpen,
}: { isOpen: boolean; setOpen: (isOpen: boolean) => void }) {
	const [value, setValue] = React.useState("");
	const textareaRef = React.useRef<HTMLTextAreaElement>(null);

	const mid_threshold = 500;
	const last_threshold = 550;

	const handleChange = React.useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setValue(e.target.value);
		},
		[],
	);

	const handleDiscard = () => {
		setOpen(false);
		setValue("");
	};

	// Textarea auto increases its height on value length
	// biome-ignore lint/correctness/useExhaustiveDependencies: value is only needed here
	React.useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [value]);

	return (
		<>
			<Drawer open={isOpen} onOpenChange={setOpen}>
				<DrawerContent className="h-[90vh] bg-background-item dark:bg-background-item">
					{/* header */}
					<DrawerHeader>
						<DrawerTitle>New post</DrawerTitle>
						<DrawerDescription>
							What are you thinking?
						</DrawerDescription>
					</DrawerHeader>

					{/* body */}
					<div className="flex items-start gap-3 p-4">
						<Avatar className="h-12 w-12">
							{/* <AvatarImage src={user?.imageUrl} alt="User Avatar" /> */}
							<AvatarFallback>PIZ</AvatarFallback>
						</Avatar>

						<div className="flex w-full flex-col gap-2">
							{/* <Badge className="w-fit">{user?.username}</Badge> */}

							{/* form */}
							<div className="w-full flex-start flex-col gap-2">
								<Textarea
									ref={textareaRef}
									value={value}
									onChange={handleChange}
									placeholder="Type here ..."
									className=" resize-none border-none p-0 focus-visible:ring-0"
								/>
								<div className="flex space-x-4">
									<ImageIcon />
									<HashIcon />
									<MenuIcon />
								</div>
							</div>
						</div>
					</div>

					{/* footer */}
					<DrawerFooter>
						<div className="flex-between gap-3">
							<Button
								className="w-full"
								variant="outline"
								onClick={handleDiscard}
							>
								Discard
							</Button>
							{value.length >= mid_threshold && (
								<div
									className={cn(
										"w-[100px] text-center font-black",
										value.length > last_threshold && "text-red-500",
									)}
								>
									{last_threshold - value.length}
								</div>
							)}
							<Button
								className="w-full"
								disabled={value.length > last_threshold}
							>
								Post
							</Button>
						</div>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</>
	);
}
