type Enumeration = {
  name: string;
  literalValues: LiteralValue[];
};

type LiteralValue = {
  name: string;
};

type Property = {
  default?: any;
  isAttr?: boolean;
  isId?: boolean;
  isMany?: boolean;
  isReference?: boolean;
  name: string;
  redefines?: string;
  serialize?: string;
  type: string;
};

type Type = {
  extends?: string[];
  isAbstract?: boolean;
  meta?: any;
  name: string;
  properties?: Property[];
  superClass?: string[];
};

type Package = {
  associations?: any[];
  enumerations?: Enumeration[];
  name: string;
  prefix: string;
  types: Type[];
  uri: string;
};

/**
 * A meta-model library.
 */
export class Moddle<T = {}> {

  /**
   * Create a new instance of Moddle.
   *
   * @param packages
   * @param config
   */
  constructor(packages: Package[], config?: Object);

  /**
   * Create a new model element.
   *
   * @param type
   * @param properties
   */
  create<Key extends keyof T>(type: Key, properties: T[Key]): Base<T[Key]>;
}

export class Base<T = {}> {

  /**
   * Get a property.
   *
   * @param name
   */
  get<Key extends keyof T>(name: Key): T[Key];

  /**
   * Set a property.
   *
   * @param name
   * @param value
   */
  set<Key extends keyof T>(name: Key, value: T[Key]): void;

  $moddle: Moddle<any>;

  $parent: Base<any>;
}