import { fileToArrayBuffer } from '$lib/utils/file';

import UPNG from "upng-js";
import jpeg from "jpeg-js";

export class Img {
	arr_buffer: ArrayBuffer;
	data: Uint8Array;
	width: number = 0;
	height: number = 0;
	file_type: string = "image/unknown";

	constructor(arr_buffer: ArrayBuffer) {
		this.arr_buffer = arr_buffer;
		this.data = new Uint8Array(0);
	}

	decode() { }

	encode() { }

	download(filename: string, file_ext: string | null = null): void {
		file_ext = file_ext ?? this.file_type.split('/')[1];

		const blob = new Blob([this.arr_buffer], { type: this.file_type });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	static async fromFile(file: File): Promise<Img> {
		const arr_buffer = await fileToArrayBuffer(file);
		switch (file.type) {
			case "image/png":
				return new ImgPNG(arr_buffer);
			case "image/jpeg":
				return new ImgJPEG(arr_buffer);
			default:
				return new Img(arr_buffer);
		}
	}
}

export class ImgPNG extends Img {
	file_type: string = "image/png";

	decode(): void {
		const img = UPNG.decode(this.arr_buffer);
		this.data = img.data;
		this.width = img.width;
		this.height = img.height;
	}

	encode(): void {
		this.arr_buffer = UPNG.encode([this.data.buffer], this.width, this.height, 0, { cnum: 256 }).buffer;
	}
}

export class ImgJPEG extends Img {
	file_type: string = "image/jpeg";

	decode(): boolean {
		try {
			const img = jpeg.decode(this.arr_buffer, { useTArray: true });
			this.data = img.data;
			this.width = img.width;
			this.height = img.height;
			return true;
		} catch (e) {
			return false;
		}
	}

	encode(): boolean {
		try {
			this.arr_buffer = jpeg.encode({ data: this.data, width: this.width, height: this.height }, 100).data;
			return true;
		} catch (e) {
			return false;
		}
	}
}
