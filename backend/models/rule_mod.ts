

export type Rule = {
  id: string;
  title: string;
  content: string;
  editing_status: string;
  images: RuleImage[];
}


export type RuleImage ={
  id: string;
  src: string;
  alt: string;
}