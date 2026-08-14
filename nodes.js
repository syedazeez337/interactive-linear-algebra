/* Content and layout for the atlas.
   form: object | op | measure | structure
   Objects are drawn at true shape. Operations are cubes. Measurements are tall
   cubes. Structure is a wide flat plate. See DESIGN-NOTES.md section 4. */

const GROUPS = [
  { id:'obj',   label: 'THE OBJECTS' },
  { id:'vops',  label: 'BUILDING WITH VECTORS' },
  { id:'meas',  label: 'MEASURING' },
  { id:'norms', label: 'NORMS' },
  { id:'space', label: 'THE SPACE' },
  { id:'mops',  label: 'BUILDING WITH MATRICES' },
  { id:'mult',  label: 'MULTIPLICATION' },
  { id:'xform', label: 'TRANSFORMATION' },
  { id:'rank',  label: 'RANK & INFORMATION' },
  { id:'proj',  label: 'PROJECTION' },
  { id:'eigen', label: 'EIGENVALUES & PCA' },
  { id:'svd',   label: 'SVD & LOW-RANK' },
  { id:'attn',  label: 'ATTENTION' }
];

const NODES = [
  /* ---------------- THE OBJECTS ---------------- */
  {
    id:'Z', key:'Z', name:'SCALAR', group:'obj', items:'1.1',
    gx:0, gy:0, w:1, d:1, h:1, form:'object',
    means:'A single number. Not a list, not a grid. Scalars are what you multiply vectors by, and they are the bottom rung of the ladder that ends at tensors.',
    compute:'Nothing to compute. 5, −2, 0.75 and π are all scalars.',
    watch:'A scalar has no direction. Multiplying by a negative scalar reverses a vector, but the scalar itself does not point anywhere.'
  },
  {
    id:'V', key:'V', name:'VECTOR', group:'obj', items:'1.2, 1.3',
    gx:2.6, gy:0, w:1, d:1, h:3, form:'object', cells:3,
    means:'An ordered list of numbers. Each entry is a component, and the number of components is the vector’s dimension. Geometrically it is an arrow from the origin.',
    compute:'Write the components in a column. v = [3, 4] has v₁ = 3 and v₂ = 4, two components, so v ∈ R².',
    watch:'Order matters. [3,4] and [4,3] are different vectors. And this dimension — the component count — is not the same as the dimension of a space, which is item 1.17.',
    widget:'vector'
  },
  {
    id:'M', key:'M', name:'MATRIX', group:'obj', items:'1.21, 2.1, 2.2',
    gx:5.2, gy:0, w:3, d:2, h:0.85, form:'object', grid:[2,3],
    means:'A rectangular grid of numbers, m rows tall and n columns wide. A column vector in Rⁿ is just an n × 1 matrix, so everything in the vector items was already a matrix one column wide.',
    compute:'aⱼ,ₖ is the entry in row j, column k. Size is quoted rows first: a grid with 2 rows and 3 columns is 2 × 3.',
    watch:'Rows first, always. Getting m × n backwards makes every size rule later fail.'
  },
  {
    id:'T', key:'T', name:'TENSOR', group:'obj', items:'1.22',
    gx:9.6, gy:0, w:3, d:2, h:0.85, form:'object', layers:3,
    means:'A multi-dimensional array. Its order is how many indices you need to reach one element: scalar 0, vector 1, matrix 2, and beyond that simply a tensor.',
    compute:'A colour image is height × width × channels, so order 3. A batch of images is order 4. Transformer input is batch × tokens × d, order 3.',
    watch:'Two different meanings. In machine learning a tensor is an n-dimensional array. In pure mathematics it is a multilinear function — a much heavier idea. LADW chapter 8 teaches the second one; you want the first.'
  },

  /* ---------------- BUILDING WITH VECTORS ---------------- */
  {
    id:'A', key:'A', name:'ADDITION', group:'vops', items:'1.4',
    gx:0, gy:5, w:2, d:2, h:2, form:'op',
    means:'Add component by component. Geometrically, place the tail of the second arrow at the head of the first; the sum runs from the original start to the final end.',
    compute:'[2,3] + [4,5] = [2+4, 3+5] = [6,8].',
    watch:'Dimensions must match. [2,3] + [4,5,6] is undefined — a 2D and a 3D vector cannot be added at all.'
  },
  {
    id:'S', key:'S', name:'SUBTRACTION', group:'vops', items:'1.5',
    gx:3, gy:5, w:2, d:2, h:2, form:'op',
    means:'The same operation with a sign flipped: a − b = a + (−b). The vector b − a points from a to b, which is why distance is built on it.',
    compute:'[8,3,−2] − [5,1,4] = [3,2,−6].',
    watch:'Same size requirement as addition. And a − b is not b − a; they point opposite ways.'
  },
  {
    id:'K', key:'K', name:'SCALAR MULTIPLE', group:'vops', items:'1.6',
    gx:6, gy:5, w:2, d:2, h:2, form:'op',
    means:'Stretch or shrink a vector without turning it. A positive scalar changes length only; a negative scalar also reverses direction.',
    compute:'kv = [kv₁, kv₂, …, kvₙ]. So 3[2,3] = [6,9] and −2[3,4] = [−6,−8].',
    watch:'Multiplying by 0 gives the zero vector, which has no direction at all.'
  },
  {
    id:'C', key:'C', name:'LINEAR COMBINATION', group:'vops', items:'1.14',
    gx:9, gy:5, w:2.4, d:2.4, h:2.4, form:'op',
    means:'Scale some vectors, then add them. This is the single most reused idea in the whole subject — span is the set of all linear combinations, matrix × vector is a linear combination, and the output of attention is one too.',
    compute:'c₁a + c₂b. With a = [1,2] and b = [3,1]: 2a + 3b = [2,4] + [9,3] = [11,7].',
    watch:'The coefficients can be any real numbers, including negative and zero.'
  },

  /* ---------------- MEASURING (tall) ---------------- */
  {
    id:'N', key:'N', name:'MAGNITUDE', group:'meas', items:'1.7',
    gx:14, gy:4.2, w:1.8, d:1.8, h:4.5, form:'measure',
    means:'The length of a vector. Pythagoras, extended to any number of components. Also called the L2 norm.',
    compute:'‖v‖ = √(v₁² + … + vₙ²). For [3,4] that is √(9+16) = 5.',
    watch:'Length is always non-negative, even when every component is negative.'
  },
  {
    id:'U', key:'U', name:'NORMALISATION', group:'meas', items:'1.8',
    gx:14, gy:7.6, w:1.8, d:1.8, h:4, form:'measure',
    means:'Divide a vector by its own length to get a unit vector — same direction, length exactly 1. Normalisation strips away magnitude and keeps only direction.',
    compute:'v̂ = v / ‖v‖. For [1,2,2] with ‖v‖ = 3, v̂ = [1/3, 2/3, 2/3], and ‖v̂‖ = √(1/9+4/9+4/9) = 1.',
    watch:'The zero vector cannot be normalised — you would divide by zero. Every other vector can.'
  },
  {
    id:'D', key:'D', name:'DISTANCE', group:'meas', items:'1.13',
    gx:18, gy:7.6, w:1.8, d:1.8, h:4, form:'measure',
    means:'How far apart two vectors are. Subtract them, then take the length of the difference.',
    compute:'d(a,b) = ‖b − a‖. With a = [1,2] and b = [4,6]: b − a = [3,4], so the distance is 5.',
    watch:'d(a,b) = d(b,a). Reversing the subtraction flips every sign, which squaring undoes.'
  },
  {
    id:'P', key:'P', name:'DOT PRODUCT', group:'meas', items:'1.9',
    gx:14, gy:0, w:2.4, d:2.4, h:6, form:'measure',
    means:'Multiply matching components and add. The result is a scalar, not a vector. This one operation is the engine of nearly everything later — angles, projection, matrix multiplication and attention scores all reduce to dot products.',
    compute:'a · b = a₁b₁ + a₂b₂ + … + aₙbₙ. So [2,3] · [4,5] = 8 + 15 = 23.',
    watch:'The output is a single number. Do not expect a vector back.',
    widget:'dot'
  },
  {
    id:'G', key:'G', name:'ANGLE', group:'meas', items:'1.10',
    gx:18, gy:0, w:1.9, d:1.9, h:5, form:'measure',
    means:'The dot product secretly encodes the angle between two vectors. Its sign alone tells you whether they broadly agree, are perpendicular, or broadly oppose.',
    compute:'a · b = ‖a‖‖b‖ cosθ, so cosθ = (a·b)/(‖a‖‖b‖). For a=[3,4], b=[4,3]: 24/25 = 0.96.',
    watch:'a·b > 0 means θ < 90°, not θ < 0°. Zero means exactly perpendicular; negative means more than 90°.'
  },
  {
    id:'O', key:'O', name:'ORTHOGONALITY', group:'meas', items:'1.11',
    gx:21.6, gy:0, w:1.9, d:1.9, h:4.5, form:'measure',
    means:'Orthogonal means perpendicular. The test is a single number, with no trigonometry needed.',
    compute:'a ⊥ b if and only if a · b = 0. For [1,2] and [2,−1]: 2 − 2 = 0, so they are perpendicular.',
    watch:'The zero vector is technically orthogonal to everything, which is usually a degenerate case rather than a useful fact.'
  },
  {
    id:'Q', key:'Q', name:'COSINE SIMILARITY', group:'meas', items:'1.12',
    gx:18, gy:3.6, w:2, d:2, h:5.5, form:'measure',
    means:'Use cosθ itself as a similarity score. Because the formula divides by both lengths, it measures direction only and ignores magnitude — which is exactly what you want for embeddings, where a longer vector is not “more” of a word.',
    compute:'Same formula as the angle. −1 ≤ cosθ ≤ 1: one means same direction, zero perpendicular, minus one opposite.',
    watch:'A high cosine similarity does not mean the vectors are close together. Two vectors of wildly different length can score 1.'
  },

  /* ---------------- NORMS (tall measurements) ---------------- */
  {
    id:'L1', key:'L1', name:'L1 NORM', group:'norms', items:'4.1',
    gx:24.5, gy:3.6, w:1.9, d:1.9, h:5, form:'measure',
    means:'Add the absolute values of the components. Also called the Manhattan or taxicab norm, because it measures the distance a taxi drives along city blocks instead of cutting across.',
    compute:'‖v‖₁ = |v₁| + |v₂| + … + |vₙ|. For [3,−4] that is |3| + |−4| = 7.',
    watch:'The L1 norm treats a step along one axis and a diagonal step very differently — [3,0] and [3,4] are not equally “small”.',
    widget:'l1norm'
  },
  {
    id:'LI', key:'LI', name:'L∞ NORM', group:'norms', items:'4.2',
    gx:24, gy:7.6, w:1.9, d:1.9, h:4.5, form:'measure',
    means:'Take the largest absolute component. Also called the max norm or Chebyshev norm. It reports the single largest magnitude and ignores everything else.',
    compute:'‖v‖∞ = max(|v₁|, |v₂|, …, |vₙ|). For [3,−4] that is max(3,4) = 4.',
    watch:'It is blind to every component except the biggest. [5,0] and [5,1000] have the same L∞ norm — a very different shape from L2.',
    widget:'linfnorm'
  },
  {
    id:'NC', key:'NC', name:'COMPARE NORMS', group:'norms', items:'4.3',
    gx:22, gy:10.2, w:2.4, d:2.4, h:2.4, form:'op',
    means:'One vector, three ways to measure it. The unit “circle” — the set of vectors with norm 1 — shows what each norm thinks of as distance one from the origin.',
    compute:'‖v‖₁ = |v₁|+|v₂| · ‖v‖₂ = √(v₁²+v₂²) · ‖v‖∞ = max(|v₁|,|v₂|).',
    watch:'These are not interchangeable. L1 shrinks large outliers less, L∞ shrinks them more, and L2 sits between. Sparsity and robustness later depend on exactly this.',
    widget:'normcompare'
  },

  /* ---------------- THE SPACE (flat plates) ---------------- */
  {
    id:'W', key:'W', name:'VECTOR SPACE', group:'space', items:'1.15, 1.16',
    gx:0, gy:11, w:5, d:4, h:0.5, form:'structure',
    means:'A set of objects with addition and scalar multiplication defined, where results always stay inside the set. Rⁿ is the one you have been working in all along; matrices and polynomials are also vector spaces.',
    compute:'Eight axioms: four about addition (commutative, associative, a zero vector, an inverse for every vector), two about multiplication, two distributive.',
    watch:'You can add two vectors and scale a vector. You cannot multiply two vectors, and you cannot add a number to a vector.'
  },
  {
    id:'E', key:'E', name:'DIMENSION', group:'space', items:'1.17',
    gx:8.2, gy:16.6, w:3, d:2.5, h:0.6, form:'structure',
    means:'The dimension of a space is the number of vectors in a basis for it. A line through the origin in R² has dimension 1 even though every vector on it has two components.',
    compute:'dim V = size of any basis. Every basis of the same space has the same number of vectors, which is what makes this well defined.',
    watch:'Not the same as item 1.3. A vector’s dimension is its component count; a space’s dimension is its basis size. They often differ.'
  },
  {
    id:'B', key:'B', name:'BASIS', group:'space', items:'1.18',
    gx:0, gy:16.6, w:3, d:2.5, h:0.6, form:'structure',
    means:'A minimal set of vectors that can build the whole space. A basis is a coordinate system, and the coefficients are the coordinates.',
    compute:'A basis spans the space and is linearly independent. The standard basis of R² is e₁ = [1,0], e₂ = [0,1], and 3e₁ + 5e₂ = [3,5].',
    watch:'A space has infinitely many different bases, but they all contain the same number of vectors.'
  },
  {
    id:'I', key:'I', name:'INDEPENDENCE', group:'space', items:'1.19',
    gx:4.1, gy:16.6, w:3, d:2.5, h:0.6, form:'structure',
    means:'No vector in the set can be built from the others — nothing is redundant. Two independent vectors in R² span the whole plane; two dependent ones span only a line.',
    compute:'[1,0] and [0,1] are independent: no scalar c gives c[1,0] = [0,1]. But [1,2] and [2,4] are dependent, because the second is twice the first.',
    watch:'More than n vectors in Rⁿ must be dependent, no matter what they are.'
  },
  {
    id:'R', key:'R', name:'THE RELATIONSHIP', group:'space', items:'1.20',
    gx:0, gy:20.5, w:6, d:2.5, h:0.5, form:'structure',
    means:'Span, independence, basis and dimension are one idea seen from four angles. A basis has to hit the dimension exactly: too few vectors cannot span, too many cannot stay independent.',
    compute:'In Rⁿ: fewer than n vectors can never span; more than n must be dependent; exactly n means independent ⇔ spans ⇔ basis.',
    watch:'The basis theorem means that once you know the dimension you only need to check one of the two conditions, not both.'
  },

  /* ---------------- BUILDING WITH MATRICES ---------------- */
  {
    id:'MA', key:'MA', name:'ADD / SUBTRACT', group:'mops', items:'2.3, 2.4',
    gx:14, gy:12.5, w:2.5, d:2, h:1.3, form:'op',
    means:'Entry by entry, exactly like vectors. Nothing new is happening — this is the vector rule applied to a grid.',
    compute:'(A + B)ⱼ,ₖ = aⱼ,ₖ + bⱼ,ₖ. Subtraction the same with a minus.',
    watch:'Defined only when A and B are the same size. Same restriction as vector addition.'
  },
  {
    id:'MK', key:'MK', name:'SCALAR × MATRIX', group:'mops', items:'2.5',
    gx:17.5, gy:12.5, w:2.5, d:2, h:1.3, form:'op',
    means:'Multiply every entry by the scalar. Together with matrix addition this makes the set of all m × n matrices a vector space in its own right.',
    compute:'kA multiplies each entry by k. So 3[[1,2],[3,4]] = [[3,6],[9,12]].',
    watch:'No size restriction here — any scalar works on any matrix.'
  },
  {
    id:'TR', key:'TR', name:'TRANSPOSE', group:'mops', items:'2.6',
    gx:21, gy:12.5, w:2.5, d:2.5, h:1.7, form:'op',
    means:'Turn the rows into columns. Mostly a bookkeeping operation — until you reach attention, where the transpose in QKᵀ is the only reason the shapes line up at all.',
    compute:'(Aᵀ)ⱼ,ₖ = Aₖ,ⱼ. An m × n matrix becomes n × m, and (Aᵀ)ᵀ = A.',
    watch:'Transposing changes the size unless the matrix is square. A 2 × 3 becomes a 3 × 2.'
  },

  /* ---------------- MULTIPLICATION ---------------- */
  {
    id:'MV', key:'MV', name:'MATRIX × VECTOR', group:'mult', items:'2.7',
    gx:14, gy:16.5, w:3, d:2.5, h:2.2, form:'op',
    means:'The most important operation in the subject. Two ways to see it: each output entry is a row dotted with the vector, or the output is a linear combination of the columns. The second reading is why the set of all outputs is the span of the columns.',
    compute:'Ax = x₁(col 1) + x₂(col 2) + … + xₙ(col n). Sizes: (m × n)(n × 1) = (m × 1).',
    watch:'The vector’s length must equal the matrix’s column count. A 2 × 3 matrix can only eat a 3-component vector.',
    widget:'matvec'
  },
  {
    id:'VM', key:'VM', name:'VECTOR × MATRIX', group:'mult', items:'2.8',
    gx:18, gy:16.5, w:3, d:2.5, h:2.2, form:'op',
    means:'A row vector on the left. The mirror image of the previous item: a column vector on the right combines the columns, a row vector on the left combines the rows.',
    compute:'[1,2] × [[1,2,3],[4,5,6]] = [9,12,15], which is also 1·[1,2,3] + 2·[4,5,6].',
    watch:'xA and Ax are different operations, and usually only one of the two is even defined.'
  },
  {
    id:'MM', key:'MM', name:'MATRIX × MATRIX', group:'mult', items:'2.9',
    gx:22, gy:16.5, w:3.4, d:3, h:2.6, form:'op',
    means:'Every entry is a row of A dotted with a column of B. Composing two transformations: in AB, the transformation B happens first and A second, so read it right to left.',
    compute:'(AB)ⱼ,ₖ = (row j of A) · (column k of B). Sizes: (m × n)(n × r) = (m × r) — inner numbers must match and vanish, outer numbers survive.',
    watch:'AB ≠ BA. Matrix multiplication is not commutative, and often only one order is even defined.'
  },

  /* ---------------- TRANSFORMATION ---------------- */
  {
    id:'X', key:'X', name:'GEOMETRIC MEANING', group:'xform', items:'2.10',
    gx:14, gy:20.8, w:4, d:3, h:1.6, form:'op',
    means:'A matrix is a function. It takes a vector in and gives a vector out, and the columns of the matrix are exactly where the basis vectors land. To build any transformation, work out where e₁ and e₂ should go and write those down as the columns.',
    compute:'T(x) = Ax. Columns = input dimension, rows = output dimension. Rotation by 90° is [[0,−1],[1,0]]; reflection over the y-axis is [[−1,0],[0,1]].',
    watch:'Columns give the input dimension and rows the output — the opposite way round from how the size m × n is quoted.'
  },
  {
    id:'DR', key:'DR', name:'4D → 3D', group:'xform', items:'2.11',
    gx:19, gy:20.8, w:3, d:2, h:1.2, form:'op', slices:4,
    means:'Reducing dimension destroys information, and you cannot undo it. Many different 4D vectors collapse onto the same 3D output, and once collapsed there is no telling which one you started with.',
    compute:'Needs 4 columns and 3 rows, so a 3 × 4 matrix. The identity-with-a-missing-row example simply deletes the fourth component.',
    watch:'Irreversible. No matrix can recover the discarded component.'
  },
  {
    id:'DI', key:'DI', name:'4D → 6D', group:'xform', items:'2.12',
    gx:23, gy:20.8, w:3, d:2, h:1.2, form:'op', slices:6,
    means:'The output lives in R⁶ but only fills a 4-dimensional slice of it. Raising dimension cannot create information, because every output is a linear combination of just four columns.',
    compute:'Needs 4 columns and 6 rows, so a 6 × 4 matrix.',
    watch:'A bigger output space is not more information. This is the idea that becomes rank in section 5.'
  },

  /* ---------------- RANK & INFORMATION ---------------- */
  {
    id:'RK', key:'RK', name:'RANK', group:'rank', items:'5.1',
    gx:31.5, gy:22, w:1.8, d:1.8, h:4.5, form:'measure',
    means:'The number of genuinely independent directions a matrix carries. It is the dimension of the span of its columns, and it cannot exceed either the number of rows or the number of columns.',
    compute:'rank A = number of pivots in reduced row echelon form. For A = [[1,2],[3,4]] the two columns are independent, so rank A = 2.',
    watch:'Rank counts independent directions, not entries. A huge matrix can still be rank 1, and a rank-1 matrix cannot carry more than one direction of information.',
    widget:'rank'
  },
  {
    id:'RS', key:'RS', name:'RANK & SPAN', group:'rank', items:'5.2, 5.3',
    gx:36.4, gy:22, w:5, d:3, h:0.5, form:'structure',
    means:'The span of the columns is the set of all outputs, and its dimension is exactly the rank. Rank is the true size of the reachable space — the rest is padding.',
    compute:'Columns span a line → rank 1. Columns span a plane → rank 2. For an m×n matrix, rank ≤ min(m,n).',
    watch:'Two different matrices can have the same span and the same rank even when their entries look completely different.',
    widget:'rankspan'
  },
  {
    id:'LO', key:'LO', name:'LORA', group:'rank', items:'5.4',
    gx:44, gy:22, w:2.4, d:2.4, h:2.4, form:'op',
    means:'Low-Rank Adaptation. Instead of retraining a huge weight matrix W, learn a small update ΔW = BA where B and A are thin. The update lives in a low-rank subspace, so it is cheap and the original stays frozen.',
    compute:'W_new = W + ΔW, with ΔW = BA, B is (d×r), A is (r×k), r ≪ min(d,k).',
    watch:'r is the budget of new information. Too small and the update cannot represent what you need; too large and you have thrown away the point of the trick.',
    widget:'lora'
  },

  /* ---------------- PROJECTION ---------------- */
  {
    id:'PR', key:'PR', name:'PROJECTION', group:'proj', items:'6.1',
    gx:9.5, gy:24, w:2.2, d:2.2, h:2.2, form:'op',
    means:'Drop a vector straight down onto a line or plane so the shadow is the closest point to the original. The original minus the shadow is perpendicular to the target.',
    compute:'proj onto line through u: (v·u / u·u) u.',
    watch:'Projecting loses the perpendicular part forever. You cannot recover v from its shadow alone — the perpendicular bit is gone.',
    widget:'projection'
  },
  {
    id:'PF', key:'PF', name:'PROJECTION FORMULA', group:'proj', items:'6.2, 6.3',
    gx:29.3, gy:24, w:2.2, d:2.2, h:2.2, form:'op',
    means:'The formula scales the unit direction of u by how far v reaches along it. The dot product is the ruler; dividing by u·u turns u into that ruler.',
    compute:'proj_u(v) = ((v·u)/(u·u)) u. If u is already a unit vector the denominator is 1.',
    watch:'The formula always returns a multiple of u, so it must lie on the line. If v is already on the line, it returns v unchanged.',
    widget:'projformula'
  },
  {
    id:'PI', key:'PI', name:'WHY PROJECTION MATTERS', group:'proj', items:'6.4, 6.5',
    gx:48.1, gy:24, w:4, d:3, h:0.5, form:'structure',
    means:'Projection is how you replace a point with its best approximation in a smaller space. That one idea is least-squares regression, compression, and the first step of PCA.',
    compute:'The residual v − proj_u(v) is the error. Minimising its length is exactly the least-squares problem.',
    watch:'“Best” means closest in Euclidean distance, which is a choice. Other norms give different best approximations.',
    widget:'whyproj'
  },

  /* ---------------- EIGENVALUES & PCA ---------------- */
  {
    id:'EV', key:'EV', name:'EIGENVECTOR', group:'eigen', items:'7.1, 7.2, 7.4',
    gx:0, gy:28, w:2.2, d:2.2, h:2.2, form:'op',
    means:'A vector that a matrix only stretches or shrinks, never turns. The direction survives the transformation; only its length changes.',
    compute:'Av = λv. The output is a scalar multiple of the input — same line, new length.',
    watch:'Most vectors do get turned. Only very special directions are eigenvectors, and a matrix may have none (over the reals) or several.',
    widget:'eigen'
  },
  {
    id:'EC', key:'EC', name:'EIGENVALUE & CALCULATION', group:'eigen', items:'7.3, 7.5',
    gx:9.3, gy:28, w:1.8, d:1.8, h:4.5, form:'measure',
    means:'The scalar λ that reports how much an eigenvector is stretched. Negative λ flips, |λ|>1 grows, |λ|<1 shrinks.',
    compute:'Solve det(A − λI) = 0, then for each λ solve (A − λI)v = 0.',
    watch:'The zero vector always satisfies Av = λv but is not an eigenvector. Eigenvectors must be non-zero.',
    widget:'eigencalc'
  },
  {
    id:'PD', key:'PD', name:'PCA IN DEPTH', group:'eigen', items:'7.6',
    gx:15.2, gy:28, w:5, d:3, h:0.5, form:'structure',
    means:'Principal Component Analysis finds the directions of greatest variance. Those directions are eigenvectors of the covariance matrix, and the corresponding eigenvalues say how much variance each direction carries.',
    compute:'Centre the data, build XᵀX, find its eigenvectors — the largest eigenvalue gives the first principal component.',
    watch:'Eigenvectors are directions, not axes you choose. PCA always finds the same axes for the same data, up to sign.',
    widget:'pca'
  },

  /* ---------------- SVD & LOW-RANK ---------------- */
  {
    id:'SV', key:'SV', name:'SVD', group:'svd', items:'8.1',
    gx:23, gy:28, w:2.4, d:2.4, h:2.4, form:'op',
    means:'Every matrix factors into A = UΣVᵀ: rotate, stretch along the axes, then rotate again. It is the most complete decomposition a matrix has.',
    compute:'A = UΣVᵀ, with U and V orthogonal and Σ diagonal holding the singular values.',
    watch:'U and Vᵀ are not the same. The first is a change of output basis, the second a change of input basis.',
    widget:'svd'
  },
  {
    id:'SG', key:'SG', name:'SVD GEOMETRY', group:'svd', items:'8.2, 8.3',
    gx:31, gy:28, w:4, d:3, h:0.5, form:'structure',
    means:'Read A = UΣVᵀ right to left: Vᵀ rotates the input, Σ stretches along coordinate axes, U rotates the result into the output space. A circle becomes an ellipse whose axes are the singular vectors.',
    compute:'The singular values are the lengths of the ellipse axes; the columns of U and V are those axes in the output and input spaces.',
    watch:'The order matters and cannot be swapped. Rotate → scale → rotate is what the factors literally say.',
    widget:'svdgeom'
  },
  {
    id:'SP', key:'SP', name:'LOW-RANK & PIXELS', group:'svd', items:'8.4, 8.5',
    gx:40.6, gy:28, w:3, d:2.4, h:0.85, form:'object', grid:[2,3],
    means:'Keep only the largest singular values and you get a low-rank approximation of the original. Most of the energy in an image lives in the first few singular values, so a 1000×1000 image can be approximated well with a handful.',
    compute:'A ≈ U_k Σ_k V_kᵀ using the top k singular values. Storage drops from 1000×1000 numbers to roughly k×(1000+1000+1).',
    watch:'Low rank is an approximation. The dropped singular values are information you chose to throw away.',
    widget:'svdpixels'
  },

  /* ---------------- ATTENTION ---------------- */
  {
    id:'QK', key:'QK', name:'Q, K, V', group:'attn', items:'9.1, 9.2',
    gx:3, gy:31.5, w:4, d:2.5, h:0.9, form:'object', layers:3,
    means:'Attention starts with three matrices learned from the input: Queries ask “what am I looking for”, Keys answer “what do I contain”, Values are “what would I hand over”. All three are just linear maps of the same token vectors.',
    compute:'Q = XW_Q, K = XW_K, V = XW_V. If X is (n×d), each of Q, K, V is (n×d_k) or (n×d_v).',
    watch:'Q, K and V are different projections of the same input. They are not three separate inputs.',
    widget:'qkv'
  },
  {
    id:'QT', key:'QT', name:'QKᵀ & SCALING', group:'attn', items:'9.3, 9.4',
    gx:28.6, gy:31.5, w:2, d:2, h:2, form:'op',
    means:'Take the dot product of every query with every key. The transpose is what makes the inner dimensions line up, and dividing by √d_k keeps those dot products from blowing up as the dimension grows.',
    compute:'S = QKᵀ / √d_k. Sizes: (n×d_k)(d_k×n) = (n×n), a score for every query-key pair.',
    watch:'Without the transpose the shapes do not match. Without the √d_k the softmax gets pushed into saturation for large d_k.',
    widget:'qkt'
  },
  {
    id:'SM', key:'SM', name:'SOFTMAX', group:'attn', items:'9.5',
    gx:38.7, gy:31.5, w:2, d:2, h:2, form:'op',
    means:'Turn each row of scores into a probability distribution that sums to one. The largest scores get most of the mass, but every key keeps a non-zero share.',
    compute:'softmax(z)ᵢ = e^zᵢ / Σⱼ e^zⱼ.',
    watch:'Softmax is not a hard max. It always gives some weight to everyone, and exponentiating makes large scores dominate sharply.',
    widget:'softmax'
  },
  {
    id:'AT', key:'AT', name:'FULL ATTENTION', group:'attn', items:'9.6',
    gx:44.3, gy:31.5, w:5, d:3, h:0.5, form:'structure',
    means:'Attention is a soft lookup: scores tell you where to look, softmax turns them into weights, and multiplying by V gathers the values weighted by those scores.',
    compute:'Attention(Q,K,V) = softmax(QKᵀ/√d_k) V.',
    watch:'The output is a weighted sum of values, not of keys. Keys and queries only decide the weights.',
    widget:'attention'
  }
];

/* The learning path, in checklist order. Drives the flow animation and up/down keys. */
const PATH = ['Z','V','A','S','K','N','U','P','G','O','Q','D','C',
              'W','E','B','I','R','M','T','MA','MK','TR','MV','VM','MM','X','DR','DI',
              'L1','LI','NC',
              'RK','RS','LO','PR','PF','PI','EV','EC','PD','SV','SG','SP','QK','QT','SM','AT'];

/* Which playground each node opens. Every live node has one. */
const WIDGET_OF = {
  Z:'scalar', V:'vector', M:'matrix', T:'tensor',
  A:'add', S:'sub', K:'scale', C:'lincomb',
  N:'magnitude', U:'normalise', D:'distance', P:'dot',
  G:'angle', O:'ortho', Q:'cosine',
  L1:'l1norm', LI:'linfnorm', NC:'normcompare',
  W:'space', E:'dimension', B:'basis', I:'independence', R:'relationship',
  MA:'matadd', MK:'matscale', TR:'transpose',
  MV:'matvec', VM:'vecmat', MM:'matmat',
  X:'transform', DR:'reduce', DI:'increase',
  RK:'rank', RS:'rankspan', LO:'lora',
  PR:'projection', PF:'projformula', PI:'whyproj',
  EV:'eigen', EC:'eigencalc', PD:'pca',
  SV:'svd', SG:'svdgeom', SP:'svdpixels',
  QK:'qkv', QT:'qkt', SM:'softmax', AT:'attention'
};
NODES.forEach(function (n) { if (WIDGET_OF[n.id]) n.widget = WIDGET_OF[n.id]; });

/* Extra edges that are relationships rather than path steps. */
const LINKS = [
  ['V','N'], ['V','A'], ['N','U'], ['P','G'], ['G','O'], ['G','Q'], ['P','Q'],
  ['S','D'], ['N','D'], ['C','W'], ['C','B'], ['B','I'], ['B','E'], ['I','R'],
  ['E','R'], ['M','TR'], ['M','MV'], ['V','MV'], ['MV','MM'], ['MV','X'],
  ['X','DR'], ['X','DI'], ['MV','VM'], ['C','MV'], ['M','T'], ['M','MA'],
  ['P','MV'], ['R','M'],
  ['N','L1'], ['N','LI'], ['N','NC'], ['L1','NC'], ['LI','NC'], ['D','L1'],
  ['DR','RK'], ['DI','RK'], ['MV','RK'], ['RK','RS'], ['R','RS'], ['RS','LO'],
  ['O','PR'], ['P','PR'], ['PR','PF'], ['PF','PI'], ['PI','PD'], ['PR','PD'],
  ['EV','EC'], ['EC','PD'], ['X','EV'], ['MV','EV'], ['EV','SV'], ['SV','SG'],
  ['SG','SP'], ['PD','SP'], ['SP','LO'], ['QK','QT'], ['TR','QT'], ['QT','SM'],
  ['SM','AT'], ['QK','AT'], ['MM','AT'], ['P','QK'], ['VM','QK']
];
