export interface IDocuments {
  readonly name: string;
  readonly pages: IPage[];
}

export interface IPage {
  readonly number: number;
  readonly imageUrl: string;
}