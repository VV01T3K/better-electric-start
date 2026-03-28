import { useLiveQuery } from "@tanstack/react-db";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
	Archive,
	Download,
	ExternalLink,
	File as FileIcon,
	FileAudio,
	FileCode,
	FileImage,
	FileSpreadsheet,
	FileText,
	FileVideo,
	LoaderCircle,
	Trash2,
	Upload,
	X,
	type LucideIcon,
} from "lucide-react";
import * as React from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Progress, ProgressLabel } from "#/components/ui/progress";
import { Skeleton } from "#/components/ui/skeleton";
import {
	MAX_FILE_SIZE_BYTES,
	UPLOAD_ACCEPT_ATTRIBUTE,
	allowedUploadContentTypes,
	formatFileSize,
	isImageContentType,
} from "#/features/files/shared";
import { getFileCount } from "#/features/files/api.server";
import { demoFilesCollection } from "#/integrations/tanstack/db/-tmp.collections";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/_authed/demo/db/files")({
	loader: async () => ({
		skeletonCount: await getFileCount(),
	}),
	component: FilesDemoPage,
});

/* ── Types & helpers ─────────────────────────────────── */

type UploadResponseBody = {
	file: {
		id: string;
	};
};

type UploadTaskStatus =
	| "queued"
	| "uploading"
	| "processing"
	| "done"
	| "error";

type UploadTask = {
	id: string;
	fileName: string;
	loadedBytes: number;
	totalBytes: number;
	percent: number;
	status: UploadTaskStatus;
	errorMessage?: string;
	fileId?: string;
};

type FormSubmitEvent = Parameters<
	NonNullable<React.ComponentProps<"form">["onSubmit"]>
>[0];

function isUploadResponseBody(
	value: UploadResponseBody | { error?: unknown } | null,
): value is UploadResponseBody {
	return Boolean(
		value &&
		typeof value === "object" &&
		"file" in value &&
		typeof value.file === "object" &&
		value.file &&
		"id" in value.file &&
		typeof value.file.id === "string",
	);
}

function parseUploadResponse(value: string) {
	try {
		return JSON.parse(value) as UploadResponseBody | { error?: unknown };
	} catch {
		return null;
	}
}

function extractUploadError(value: string) {
	const parsed = parseUploadResponse(value);
	const error =
		parsed && typeof (parsed as { error?: unknown }).error === "string"
			? (parsed as { error: string }).error
			: null;

	return error ? error : "Upload failed.";
}

function getFileTypeIcon(contentType: string): LucideIcon {
	if (contentType.startsWith("image/")) return FileImage;
	if (contentType.startsWith("video/")) return FileVideo;
	if (contentType.startsWith("audio/")) return FileAudio;
	if (
		contentType === "application/pdf" ||
		contentType.includes("word") ||
		contentType.startsWith("text/")
	)
		return FileText;
	if (
		contentType.includes("sheet") ||
		contentType.includes("excel") ||
		contentType.includes("csv")
	)
		return FileSpreadsheet;
	if (contentType.includes("zip") || contentType.includes("tar"))
		return Archive;
	if (
		contentType.includes("json") ||
		contentType.includes("xml") ||
		contentType.includes("javascript") ||
		contentType.includes("typescript") ||
		contentType.includes("css") ||
		contentType.includes("html")
	)
		return FileCode;
	return FileIcon;
}

function validateFilesForUpload(files: File[]) {
	const valid: File[] = [];
	const errors: string[] = [];

	for (const file of files) {
		if (file.size === 0) {
			errors.push(`${file.name}: file is empty`);
		} else if (file.size > MAX_FILE_SIZE_BYTES) {
			errors.push(
				`${file.name}: exceeds ${formatFileSize(MAX_FILE_SIZE_BYTES)} limit`,
			);
		} else if (!allowedUploadContentTypes.has(file.type)) {
			errors.push(
				`${file.name}: unsupported type (${file.type || "unknown"})`,
			);
		} else {
			valid.push(file);
		}
	}

	return { valid, errors };
}

/* ── Page shell ──────────────────────────────────────── */

function FilesDemoPage() {
	const { skeletonCount } = Route.useLoaderData();

	return (
		<main className="mx-auto w-full max-w-5xl px-5 py-12 sm:py-16">
			<header className="animate-fade-up mb-10">
				<p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
					Shared collection
				</p>
				<h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
					File Vault
				</h1>
				<p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
					Drop files to upload. Browse, preview, and manage your synced
					library across all authenticated clients.
				</p>
			</header>

			<ClientOnly fallback={<PageSkeleton skeletonCount={skeletonCount} />}>
				<FilesClientPage skeletonCount={skeletonCount} />
			</ClientOnly>
		</main>
	);
}

/* ── Client page ─────────────────────────────────────── */

function FilesClientPage({ skeletonCount }: { skeletonCount: number }) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
	const [validationErrors, setValidationErrors] = React.useState<string[]>([]);
	const [uploadTasks, setUploadTasks] = React.useState<UploadTask[]>([]);
	const [isDragOver, setIsDragOver] = React.useState(false);

	const { data: files, isLoading } = useLiveQuery(
		(query) =>
			query
				.from({ file: demoFilesCollection })
				.orderBy(({ file }) => file.created_at, "desc"),
		[],
	);

	const syncedFiles = React.useMemo(() => files ?? [], [files]);
	const imageCount = syncedFiles.filter((f) =>
		isImageContentType(f.content_type),
	).length;
	const totalSize = syncedFiles.reduce(
		(sum, file) => sum + file.size_bytes,
		0,
	);

	const isUploading = uploadTasks.some(
		(task) =>
			task.status === "queued" ||
			task.status === "uploading" ||
			task.status === "processing",
	);

	const selectedTotalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

	/* Remove synced tasks once their file appears in the live query */
	React.useEffect(() => {
		if (syncedFiles.length === 0) return;

		setUploadTasks((currentTasks) => {
			let changed = false;
			const nextTasks = currentTasks.filter((task) => {
				if (task.status !== "done" || !task.fileId) return true;
				const shouldKeep = !syncedFiles.some(
					(file) => file.id === task.fileId,
				);
				if (!shouldKeep) changed = true;
				return shouldKeep;
			});
			return changed ? nextTasks : currentTasks;
		});
	}, [syncedFiles]);

	function updateTask(
		taskId: string,
		updater: (task: UploadTask) => UploadTask,
	) {
		setUploadTasks((currentTasks) =>
			currentTasks.map((task) =>
				task.id === taskId ? updater(task) : task,
			),
		);
	}

	function startUpload(file: File) {
		const taskId = crypto.randomUUID();

		setUploadTasks((currentTasks) => [
			...currentTasks,
			{
				id: taskId,
				fileName: file.name,
				loadedBytes: 0,
				totalBytes: file.size,
				percent: 0,
				status: "queued",
			},
		]);

		return new Promise<void>((resolve) => {
			const xhr = new XMLHttpRequest();
			const formData = new FormData();
			formData.append("file", file);

			xhr.upload.addEventListener("progress", (event) => {
				if (!event.lengthComputable) return;
				const loadedBytes = event.loaded;
				const totalBytes = event.total;
				const percent =
					totalBytes > 0
						? Math.round((loadedBytes / totalBytes) * 100)
						: 0;

				updateTask(taskId, (task) => ({
					...task,
					loadedBytes,
					totalBytes,
					percent,
					status: "uploading",
				}));
			});

			xhr.addEventListener("loadstart", () => {
				updateTask(taskId, (task) =>
					task.status === "uploading"
						? task
						: { ...task, status: "uploading" },
				);
			});

			xhr.addEventListener("load", () => {
				if (xhr.status < 200 || xhr.status >= 300) {
					const message = extractUploadError(xhr.responseText);
					updateTask(taskId, (task) => ({
						...task,
						status: "error",
						errorMessage: message,
					}));
					resolve();
					return;
				}

				updateTask(taskId, (task) => ({
					...task,
					loadedBytes: task.totalBytes,
					totalBytes: task.totalBytes,
					percent: 100,
					status: "processing",
				}));

				const response = parseUploadResponse(xhr.responseText);

				if (!isUploadResponseBody(response)) {
					updateTask(taskId, (task) => ({
						...task,
						status: "error",
						errorMessage:
							"Upload finished, but the server response was incomplete.",
					}));
					resolve();
					return;
				}

				updateTask(taskId, (task) => ({
					...task,
					loadedBytes: task.totalBytes,
					totalBytes: task.totalBytes,
					percent: 100,
					status: "done",
					fileId: response.file.id,
				}));

				resolve();
			});

			xhr.addEventListener("error", () => {
				updateTask(taskId, (task) => ({
					...task,
					status: "error",
					errorMessage: "The upload failed before the server responded.",
				}));
				resolve();
			});

			xhr.addEventListener("abort", () => {
				updateTask(taskId, (task) => ({
					...task,
					status: "error",
					errorMessage: "The upload was canceled.",
				}));
				resolve();
			});

			xhr.open("POST", "/api/files");
			xhr.send(formData);
		});
	}

	function selectFiles(rawFiles: File[]) {
		const { valid, errors } = validateFilesForUpload(rawFiles);
		setValidationErrors(errors);
		setSelectedFiles(valid);
	}

	async function handleSubmit(event: FormSubmitEvent) {
		event.preventDefault();
		if (selectedFiles.length === 0) return;

		const filesToUpload = selectedFiles;
		setSelectedFiles([]);
		setValidationErrors([]);
		if (inputRef.current) inputRef.current.value = "";

		await Promise.allSettled(filesToUpload.map((file) => startUpload(file)));
	}

	function clearSelection() {
		setSelectedFiles([]);
		setValidationErrors([]);
		if (inputRef.current) inputRef.current.value = "";
	}

	function handleDragOver(e: React.DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(true);
	}

	function handleDragLeave(e: React.DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (!e.currentTarget.contains(e.relatedTarget as Node)) {
			setIsDragOver(false);
		}
	}

	function handleDrop(e: React.DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);
		const droppedFiles = Array.from(e.dataTransfer.files);
		if (droppedFiles.length > 0) {
			selectFiles(droppedFiles);
		}
	}

	const hasSelection = selectedFiles.length > 0;
	const hasActiveTasks = uploadTasks.length > 0;
	const isIdle = !hasSelection && !hasActiveTasks;

	return (
		<div className="space-y-8">
			{/* ── Upload zone ────────────────────────────── */}
			<form noValidate onSubmit={handleSubmit}>
				<input
					ref={inputRef}
					type="file"
					multiple
					accept={UPLOAD_ACCEPT_ATTRIBUTE}
					className="sr-only"
					onChange={(event) => {
						selectFiles(Array.from(event.currentTarget.files ?? []));
					}}
				/>

				<div
					className={cn(
						"relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ease-out",
						isIdle
							? "border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 hover:shadow-[0_8px_40px_-16px_rgba(0,0,0,0.12)]"
							: "border-primary/40 bg-card",
						isDragOver &&
							"border-primary bg-card shadow-[0_0_0_4px] shadow-primary/10",
					)}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
				>
					{/* Dot grid pattern — visible only in idle state */}
					<div
						className={cn(
							"pointer-events-none absolute inset-0 transition-opacity duration-300",
							isDragOver
								? "opacity-[0.06]"
								: isIdle
									? "opacity-[0.03]"
									: "opacity-0",
						)}
						style={{
							backgroundImage:
								"radial-gradient(circle, currentColor 0.8px, transparent 0.8px)",
							backgroundSize: "24px 24px",
							backgroundPosition: "12px 12px",
						}}
					/>

					{hasActiveTasks ? (
						/* Uploading state — progress inside the zone */
						<div className="relative space-y-3 px-5 py-6 sm:px-6">
							{uploadTasks.map((task) => (
								<div key={task.id} className="flex items-center gap-3">
									<div className="min-w-0 flex-1">
										<div className="mb-1.5 flex items-center justify-between gap-2">
											<span className="min-w-0 truncate text-sm font-medium text-foreground">
												{task.fileName}
											</span>
											<Badge
												variant={
													task.status === "error"
														? "destructive"
														: task.status === "done"
															? "secondary"
															: "outline"
												}
												className="shrink-0 rounded-md px-2 py-0.5 text-[10px]"
											>
												{task.status === "processing"
													? "Syncing"
													: task.status === "done"
														? "Done"
														: task.status === "error"
															? "Failed"
															: `${task.percent}%`}
											</Badge>
										</div>
										<Progress value={task.percent}>
											<ProgressLabel className="sr-only">
												{task.status === "error"
													? (task.errorMessage ?? "Upload failed.")
													: `${task.percent}% complete`}
											</ProgressLabel>
										</Progress>
										{task.status === "error" && task.errorMessage && (
											<p className="mt-1 text-[11px] text-destructive">
												{task.errorMessage}
											</p>
										)}
										{task.status !== "error" && (
											<p className="mt-1 text-right font-mono text-[10px] text-muted-foreground tabular-nums">
												{formatFileSize(task.loadedBytes)} /{" "}
												{formatFileSize(task.totalBytes)}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					) : hasSelection ? (
						/* Selected state */
						<div className="relative flex flex-col items-center gap-4 px-6 py-10 sm:py-12">
							<div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<Upload className="size-5" />
							</div>
							<div className="text-center">
								<p className="text-base font-semibold text-foreground">
									{selectedFiles.length}{" "}
									{selectedFiles.length === 1 ? "file" : "files"}{" "}
									selected
									<span className="ml-1.5 font-mono text-sm font-normal text-muted-foreground">
										({formatFileSize(selectedTotalSize)})
									</span>
								</p>
								<p className="mt-1 text-sm text-muted-foreground">
									Ready to upload
								</p>
							</div>
							<div className="flex gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										clearSelection();
									}}
								>
									<X className="size-3.5" />
									Clear
								</Button>
								<Button type="submit" size="sm" disabled={isUploading}>
									{isUploading ? (
										<LoaderCircle className="size-3.5 animate-spin" />
									) : (
										<Upload className="size-3.5" />
									)}
									{selectedFiles.length > 1
										? `Upload ${selectedFiles.length} files`
										: "Upload file"}
								</Button>
							</div>
						</div>
					) : (
						/* Idle state */
						<button
							type="button"
							className="relative w-full cursor-pointer"
							onClick={() => inputRef.current?.click()}
						>
							<div className="flex flex-col items-center gap-5 px-6 py-14 sm:py-20">
								<div
									className={cn(
										"flex size-16 items-center justify-center rounded-2xl transition-all duration-300",
										isDragOver
											? "scale-110 bg-primary/12 text-primary"
											: "bg-muted/30 text-muted-foreground",
									)}
								>
									<Upload
										className={cn(
											"size-7 transition-transform duration-300",
											isDragOver && "-translate-y-1",
										)}
									/>
								</div>
								<div className="text-center">
									<p
										className={cn(
											"text-base font-semibold transition-colors duration-200",
											isDragOver
												? "text-primary"
												: "text-foreground",
										)}
									>
										{isDragOver
											? "Release to upload"
											: "Drop files here"}
									</p>
									<p className="mt-1.5 text-sm text-muted-foreground">
										or click to browse &middot; images, PDFs, text,
										archives up to{" "}
										{formatFileSize(MAX_FILE_SIZE_BYTES)}
									</p>
								</div>
							</div>
						</button>
					)}
				</div>
			</form>

			{/* ── Validation errors ──────────────────────── */}
			{validationErrors.length > 0 && (
				<div className="animate-fade-up rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
					<p className="mb-1 text-xs font-medium text-destructive">
						Some files were rejected:
					</p>
					<ul className="space-y-0.5">
						{validationErrors.map((err) => (
							<li
								key={err}
								className="font-mono text-[11px] text-destructive/80"
							>
								{err}
							</li>
						))}
					</ul>
				</div>
			)}

			{/* ── Stats divider ──────────────────────────── */}
			{syncedFiles.length > 0 && (
				<div className="animate-fade-up flex items-center gap-4">
					<div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/60 to-transparent" />
					<div className="flex items-center gap-2.5 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
						<span>{syncedFiles.length} files</span>
						<span className="text-border">&#183;</span>
						<span>{imageCount} images</span>
						<span className="text-border">&#183;</span>
						<span>{formatFileSize(totalSize)}</span>
					</div>
					<div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/60 to-transparent" />
				</div>
			)}

			{/* ── Loading skeleton ────────────────────────── */}
			{isLoading && <FileListSkeleton count={skeletonCount} />}

			{/* ── File list (unified) ─────────────────────── */}
			{syncedFiles.length > 0 && (
				<section className="animate-fade-up">
					<div className="overflow-hidden rounded-xl border border-border/60">
						{syncedFiles.map((file) => (
							<FileRow key={file.id} file={file} />
						))}
					</div>
				</section>
			)}

			{/* ── Empty state ─────────────────────────────── */}
			{!isLoading && syncedFiles.length === 0 && (
				<div className="animate-fade-up stagger-2 flex flex-col items-center py-20">
					<div className="relative mb-6">
						<div className="absolute -inset-4 rounded-full bg-muted/20" />
						<div className="relative flex size-16 items-center justify-center rounded-2xl bg-muted/30">
							<Archive className="size-7 text-muted-foreground/50" />
						</div>
					</div>
					<p className="text-sm font-medium text-foreground/80">
						Your vault is empty
					</p>
					<p className="mt-1.5 text-xs text-muted-foreground">
						Upload an image, document, or archive to get started
					</p>
				</div>
			)}
		</div>
	);
}

/* ── File row (unified — images get a thumbnail, others get an icon) ── */

type SyncedFile = {
	id: string;
	original_name: string;
	content_type: string;
	size_bytes: number;
	created_at: Date;
};

function FileRow({ file }: { file: SyncedFile }) {
	const fileHref = `/api/files/${file.id}`;
	const isImage = isImageContentType(file.content_type);
	const TypeIcon = getFileTypeIcon(file.content_type);

	return (
		<div className="group flex items-center gap-3 border-b border-border/60 bg-card px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/30">
			{/* Thumbnail or icon */}
			{isImage ? (
				<div className="size-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-border/40">
					<img
						src={fileHref}
						alt={file.original_name}
						loading="lazy"
						decoding="async"
						className="size-full object-cover"
					/>
				</div>
			) : (
				<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
					<TypeIcon className="size-4" />
				</div>
			)}

			{/* Name + metadata */}
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium text-foreground">
					{file.original_name}
				</p>
				<p className="font-mono text-[11px] text-muted-foreground">
					{file.content_type} &middot; {formatFileSize(file.size_bytes)}{" "}
					&middot;{" "}
					{formatDistanceToNow(file.created_at, {
						addSuffix: true,
					})}
				</p>
			</div>

			{/* Actions */}
			<div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
				<a
					href={fileHref}
					target="_blank"
					rel="noreferrer"
					className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
					title="Open"
				>
					<ExternalLink className="size-3.5" />
				</a>
				<a
					href={`${fileHref}?download=1`}
					className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
					title="Download"
				>
					<Download className="size-3.5" />
				</a>
				<button
					type="button"
					onClick={() => demoFilesCollection.delete(file.id)}
					className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
					title="Delete"
				>
					<Trash2 className="size-3.5" />
				</button>
			</div>
		</div>
	);
}

/* ── Skeletons ───────────────────────────────────────── */

function PageSkeleton({ skeletonCount }: { skeletonCount: number }) {
	return (
		<div className="space-y-8">
			<Skeleton className="h-48 w-full rounded-2xl sm:h-56" />

			<div className="flex items-center gap-4">
				<div className="h-px flex-1 bg-border/30" />
				<Skeleton className="h-4 w-48" />
				<div className="h-px flex-1 bg-border/30" />
			</div>

			<FileListSkeleton count={skeletonCount} />
		</div>
	);
}

function FileListSkeleton({ count }: { count: number }) {
	if (count === 0) {
		return (
			<div className="flex flex-col items-center py-20">
				<Skeleton className="mb-4 size-16 rounded-2xl" />
				<Skeleton className="h-4 w-32" />
				<Skeleton className="mt-2 h-3 w-48" />
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-border/60">
			{Array.from({ length: count }, (_, i) => (
				<div
					key={i}
					className="flex items-center gap-3 border-b border-border/60 bg-card px-4 py-3 last:border-b-0"
				>
					<Skeleton className="size-10 shrink-0 rounded-lg" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-4 w-2/3" />
						<Skeleton className="h-3 w-full max-w-xs" />
					</div>
					<div className="flex gap-1.5">
						<Skeleton className="size-7 rounded-md" />
						<Skeleton className="size-7 rounded-md" />
						<Skeleton className="size-7 rounded-md" />
					</div>
				</div>
			))}
		</div>
	);
}
