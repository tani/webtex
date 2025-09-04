import he from 'he';

interface Generator {
  // Basic generator interface for packages
}

export class Textgreek {
  static displayName = 'Textgreek';
  static args: Record<string, any[]> = {};

  static symbols = new Map([
    ['textalpha', he.decode('&alpha;')], 
    ['textbeta', he.decode('&beta;')], 
    ['textgamma', he.decode('&gamma;')], 
    ['textdelta', he.decode('&delta;')], 
    ['textepsilon', he.decode('&epsilon;')], 
    ['textzeta', he.decode('&zeta;')], 
    ['texteta', he.decode('&eta;')], 
    ['texttheta', he.decode('&thetasym;')], 
    ['textiota', he.decode('&iota;')], 
    ['textkappa', he.decode('&kappa;')], 
    ['textlambda', he.decode('&lambda;')], 
    ['textmu', he.decode('&mu;')], 
    ['textmugreek', he.decode('&mu;')], 
    ['textnu', he.decode('&nu;')], 
    ['textxi', he.decode('&xi;')], 
    ['textomikron', he.decode('&omicron;')], 
    ['textpi', he.decode('&pi;')], 
    ['textrho', he.decode('&rho;')], 
    ['textsigma', he.decode('&sigma;')], 
    ['texttau', he.decode('&tau;')], 
    ['textupsilon', he.decode('&upsilon;')], 
    ['textphi', he.decode('&phi;')], 
    ['textchi', he.decode('&chi;')], 
    ['textpsi', he.decode('&psi;')], 
    ['textomega', he.decode('&omega;')], 
    ['textAlpha', he.decode('&Alpha;')], 
    ['textBeta', he.decode('&Beta;')], 
    ['textGamma', he.decode('&Gamma;')], 
    ['textDelta', he.decode('&Delta;')], 
    ['textEpsilon', he.decode('&Epsilon;')], 
    ['textZeta', he.decode('&Zeta;')], 
    ['textEta', he.decode('&Eta;')], 
    ['textTheta', he.decode('&Theta;')], 
    ['textIota', he.decode('&Iota;')], 
    ['textKappa', he.decode('&Kappa;')], 
    ['textLambda', he.decode('&Lambda;')], 
    ['textMu', he.decode('&Mu;')], 
    ['textNu', he.decode('&Nu;')], 
    ['textXi', he.decode('&Xi;')], 
    ['textOmikron', he.decode('&Omicron;')], 
    ['textPi', he.decode('&Pi;')], 
    ['textRho', he.decode('&Rho;')], 
    ['textSigma', he.decode('&Sigma;')], 
    ['textTau', he.decode('&Tau;')], 
    ['textUpsilon', he.decode('&Upsilon;')], 
    ['textPhi', he.decode('&Phi;')], 
    ['textChi', he.decode('&Chi;')], 
    ['textPsi', he.decode('&Psi;')], 
    ['textOmega', he.decode('&Omega;')], 
    ['textvarsigma', he.decode('&sigmaf;')], 
    ['straightphi', '\u03D5'], 
    ['scripttheta', '\u03D1'], 
    ['straighttheta', he.decode('&theta;')], 
    ['straightepsilon', '\u03F5']
  ]);

  private g: Generator;
  private options?: any;

  constructor(generator: Generator, options?: any) {
    this.g = generator;
    this.options = options;
  }
}