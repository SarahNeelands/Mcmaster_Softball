

export type Rule = {
  id: string;
  name: string;
  content: string;
  images: RuleImage[];
}


export type RuleImage ={
  id: string;
  src: string;
  alt: string;
}