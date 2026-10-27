// Compile-only assertions. If these stop compiling, the types regressed.
//
// A map keyed by `AdtTypeCode` is what a consumer writes in place of its own
// list of codes: the compiler then demands every code the tables serve, and
// refuses one they do not. The codes below the map are the ones our own maps
// held and no release lists (spec 1.1) — each was a request ADT could only
// refuse, and none is a code any more.

import type {
  AdtObjectKind,
  AdtSourceTypeCode,
  AdtTypeCode,
  AdtTypeCodeOf,
} from '../adt/AdtTypeTables';

// ── A typed map over the codes compiles, and must be complete ───────────────

const _kindByCode: { readonly [C in AdtTypeCode]: AdtObjectKind } = {
  'CLAS/OC': 'class',
  'INTF/OI': 'interface',
  'PROG/P': 'program',
  'PROG/I': 'include',
  'FUGR/F': 'function_group',
  'FUGR/FF': 'function_module',
  'FUGR/I': 'function_include',
  'DEVC/K': 'package',
  'DDLS/DF': 'ddl',
  'TABL/DT': 'table',
  'TABL/DS': 'structure',
  'TTYP/DA': 'table_type',
  'DOMA/DD': 'domain',
  'DTEL/DE': 'data_element',
  'DCLS/DL': 'access_control',
  'BDEF/BDO': 'behavior_definition',
  'DDLX/EX': 'metadata_extension',
  'SRVD/SRV': 'service_definition',
  'SRVB/SVB': 'service_binding',
  'DSFD/SCF': 'scalar_function',
  'DSFI/SFI': 'scalar_function_implementation',
  'XSLT/VT': 'transformation',
  'MSAG/N': 'message_class',
  'MSAG/NN': 'message_class_message',
  'FTG2/FT': 'feature_toggle',
  AUTH: 'authorization_field',
  'ENHO/XHH': 'enhancement',
  'ENHO/XHB': 'enhancement',
  'ENHS/XSB': 'enhancement',
};
void _kindByCode;

// @ts-expect-error a map over the codes that leaves one out does not compile
const _incomplete: { readonly [C in AdtTypeCode]: AdtObjectKind } = {
  'CLAS/OC': 'class',
};
void _incomplete;

// A variant's own codes: 7.40 serves no DDIC object through ADT, so a map
// over its codes neither needs nor accepts one.
const _basis740: { readonly [C in AdtTypeCodeOf<'basis740'>]: true } = {
  'CLAS/OC': true,
  'INTF/OI': true,
  'PROG/P': true,
  'PROG/I': true,
  'FUGR/F': true,
  'FUGR/FF': true,
  'FUGR/I': true,
  'DDLS/DF': true,
  'MSAG/N': true,
  'MSAG/NN': true,
  // @ts-expect-error 7.40's ADT serves no table
  'TABL/DT': true,
};
void _basis740;

// A code with no source is no source code.
// @ts-expect-error a domain is its document, it has no source
const _domainSource: AdtSourceTypeCode = 'DOMA/DD';
void _domainSource;
const _classSource: AdtSourceTypeCode = 'CLAS/OC';
void _classSource;

// ── The codes no release lists (spec 1.1) are not codes ─────────────────────

// @ts-expect-error the releases list INTF/OI
const _intfIf: AdtTypeCode = 'INTF/IF';
void _intfIf;

// @ts-expect-error the releases list TABL/DS
const _struDt: AdtTypeCode = 'STRU/DT';
void _struDt;

// @ts-expect-error the releases list TABL/DS
const _struDs: AdtTypeCode = 'STRU/DS';
void _struDs;

// @ts-expect-error the releases list TTYP/DA
const _ttypDf: AdtTypeCode = 'TTYP/DF';
void _ttypDf;

// @ts-expect-error the releases list TTYP/DA
const _ttypTt: AdtTypeCode = 'TTYP/TT';
void _ttypTt;

// @ts-expect-error the releases list TTYP/DA
const _ttypSt: AdtTypeCode = 'TTYP/ST';
void _ttypSt;

// @ts-expect-error the releases list DOMA/DD
const _domaDm: AdtTypeCode = 'DOMA/DM';
void _domaDm;

// @ts-expect-error the releases list BDEF/BDO
const _bdefBd: AdtTypeCode = 'BDEF/BD';
void _bdefBd;

// @ts-expect-error a behavior implementation is a class, CLAS/OC
const _bimpBim: AdtTypeCode = 'BIMP/BIM';
void _bimpBim;

// @ts-expect-error no release lists FUGR/FC
const _fugrFc: AdtTypeCode = 'FUGR/FC';
void _fugrFc;

// `FUNC` meant a function group to one map and a function module to another.
// @ts-expect-error a function module is FUGR/FF, a function group FUGR/F
const _func: AdtTypeCode = 'FUNC';
void _func;

// @ts-expect-error the releases list SCGR/3G, and the library serves neither
const _scgr: AdtTypeCode = 'SCGR';
void _scgr;

// Nor is a code in lower case, or a friendly name.
// @ts-expect-error a code is upper case
const _lower: AdtTypeCode = 'clas/oc';
void _lower;

// @ts-expect-error a kind is not a code
const _friendly: AdtTypeCode = 'class';
void _friendly;
