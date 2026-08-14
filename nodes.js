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
  { id:'eigen', label: 'EIGENVALUES & PRINCIPAL COMPONENTS' },
  { id:'svd',   label: 'SINGULAR VALUES & LOW RANK' },
  { id:'attn',  label: 'ATTENTION' }
];

const NODES = [
  /* ---------------- THE OBJECTS ---------------- */
  {
    id:'Z', key:'Z', name:'SCALAR', group:'obj', items:'1.1',
    gx:0, gy:0, w:1, d:1, h:1, form:'object',
    means:'The bottom rung of the ladder that ends at tensors. A scalar carries size and sign but no direction, which is why multiplying a vector by one changes its length without turning it.',
    compute:'A single number. 5, −2, 0.75 and π are all scalars. Nothing to evaluate.',
    watch:'A scalar has no direction. Multiplying by a negative scalar reverses a vector, but the scalar itself does not point anywhere.'
  },
  {
    id:'V', key:'V', name:'VECTOR', group:'obj', items:'1.2, 1.3',
    gx:2.6, gy:0, w:1, d:1, h:3, form:'object', cells:3,
    means:'An arrow from the origin, written down as an ordered list. Order carries meaning: [3,4] and [4,3] point to different places. The component count fixes which space the vector lives in.',
    compute:'Write the components in a column. v = [3,4] has v₁ = 3 and v₂ = 4, so v has two components and lives in R².',
    watch:'Order matters. [3,4] and [4,3] are different vectors. This dimension counts components. The dimension of a space, item 1.17, counts something else.',
    widget:'vector'
  },
  {
    id:'M', key:'M', name:'MATRIX', group:'obj', items:'1.21, 2.1, 2.2',
    gx:5.2, gy:0, w:3, d:2, h:0.85, form:'object', grid:[2,3],
    means:'A grid of numbers that doubles as a function: feed it a vector and it returns another. Every column vector you have already handled was a matrix one column wide, so none of the earlier rules change here.',
    compute:'An m × n matrix has m rows and n columns, quoted rows first. Entry aⱼ,ₖ sits in row j, column k. A grid with 2 rows and 3 columns is 2 × 3.',
    watch:'Rows first, always. Getting m × n backwards makes every size rule later fail.'
  },
  {
    id:'T', key:'T', name:'TENSOR', group:'obj', items:'1.22',
    gx:9.6, gy:0, w:3, d:2, h:0.85, form:'object', layers:3,
    means:'The same ladder continued past matrices. Order counts how many indices you need to reach one element, so a scalar sits at 0 and a matrix at 2. Anything above 2 takes the name tensor.',
    compute:'Count the indices. A colour image is height × width × channels, order 3. A batch of images is order 4. Transformer input is batch × tokens × d, order 3.',
    watch:'Two different meanings. In machine learning a tensor is an n-dimensional array. In pure mathematics it is a multilinear function, a much heavier idea. LADW chapter 8 teaches the second one; you want the first.'
  },

  /* ---------------- BUILDING WITH VECTORS ---------------- */
  {
    id:'A', key:'A', name:'ADDITION', group:'vops', items:'1.4',
    gx:0, gy:5, w:2, d:2, h:2, form:'op',
    means:'Laying one arrow tail to head against the other and reading off where you finish. The order you lay them in makes no difference to where you land, which is why a + b and b + a agree.',
    compute:'Add component by component. [2,3] + [4,5] = [2+4, 3+5] = [6,8]. Both vectors need the same number of components.',
    watch:'Dimensions must match. [2,3] + [4,5,6] is undefined, because a 2-component and a 3-component vector cannot be added at all.'
  },
  {
    id:'S', key:'S', name:'SUBTRACTION', group:'vops', items:'1.5',
    gx:3, gy:5, w:2, d:2, h:2, form:'op',
    means:'Addition with one sign flipped, since a − b = a + (−b). The result b − a is the arrow that carries you from a to b, and its length is the distance between them.',
    compute:'Subtract component by component. [8,3,−2] − [5,1,4] = [3,2,−6]. Sizes must match, as with addition.',
    watch:'Same size requirement as addition. And a − b is not b − a; they point opposite ways.'
  },
  {
    id:'K', key:'K', name:'SCALAR MULTIPLE', group:'vops', items:'1.6',
    gx:6, gy:5, w:2, d:2, h:2, form:'op',
    means:'Movement along one fixed line. Whatever scalar you pick, kv stays on the line through v and the origin, so scaling changes length and sign but never direction.',
    compute:'kv = [kv₁, kv₂, …, kvₙ]. So 3[2,3] = [6,9] and −2[3,4] = [−6,−8]. Length scales by |k|, not by k.',
    watch:'Multiplying by 0 gives the zero vector, which has no direction at all.'
  },
  {
    id:'C', key:'C', name:'LINEAR COMBINATION', group:'vops', items:'1.14',
    gx:9, gy:5, w:2.4, d:2.4, h:2.4, form:'op',
    means:'The idea the rest of the subject keeps reusing. Span is the set of every linear combination you can form from a few vectors, and matrix times vector turns out to be one such combination of the columns.',
    compute:'c₁a + c₂b. With a = [1,2] and b = [3,1], 2a + 3b = [2,4] + [9,3] = [11,7]. The coefficients may be any real numbers, zero and negatives included.',
    watch:'The coefficients can be any real numbers, including negative and zero.'
  },

  /* ---------------- MEASURING (tall) ---------------- */
  {
    id:'N', key:'N', name:'MAGNITUDE', group:'meas', items:'1.7',
    gx:14, gy:4.2, w:1.8, d:1.8, h:4.5, form:'measure',
    means:'Pythagoras carried past two dimensions. The squares of the components add the same way whether a vector has 2 entries or 700, which is what lets you talk about length in spaces you cannot draw. Also called the L2 norm.',
    compute:'‖v‖ = √(v₁² + … + vₙ²). For [3,4] that is √(9+16) = 5. The result is never negative.',
    watch:'Length is always non-negative, even when every component is negative.'
  },
  {
    id:'U', key:'U', name:'NORMALISATION', group:'meas', items:'1.8',
    gx:14, gy:7.6, w:1.8, d:1.8, h:4, form:'measure',
    means:'Throwing away length so only direction survives. Two vectors pointing the same way normalise to the identical unit vector, and that is what makes cosine similarity possible.',
    compute:'v̂ = v / ‖v‖. For [1,2,2] with ‖v‖ = 3, v̂ = [1/3, 2/3, 2/3] and ‖v̂‖ = 1. The zero vector has no unit form.',
    watch:'The zero vector cannot be normalised, since you would divide by zero. Every other vector can.'
  },
  {
    id:'D', key:'D', name:'DISTANCE', group:'meas', items:'1.13',
    gx:18, gy:7.6, w:1.8, d:1.8, h:4, form:'measure',
    means:'Length applied to a difference. Subtraction already gives the arrow from one point to the other, so distance needs no new machinery. Swapping the two points flips every sign and squaring undoes that, which is why d(a,b) and d(b,a) agree.',
    compute:'d(a,b) = ‖b − a‖. With a = [−1,−1] and b = [2,3], b − a = [3,4] and the distance is 5.',
    watch:'d(a,b) = d(b,a). Reversing the subtraction flips every sign, which squaring undoes.'
  },
  {
    id:'P', key:'P', name:'DOT PRODUCT', group:'meas', items:'1.9',
    gx:14, gy:0, w:2.4, d:2.4, h:6, form:'measure',
    means:'The operation everything later is built from. Angles, projection and attention scores all reduce to it. Two vectors go in and one number comes out, so it compresses direction and length into a single comparable quantity.',
    compute:'a · b = a₁b₁ + a₂b₂ + … + aₙbₙ. So [2,3] · [4,5] = 8 + 15 = 23. Both vectors need the same length, and the answer is a scalar.',
    watch:'The output is a single number. Do not expect a vector back.',
    widget:'dot'
  },
  {
    id:'G', key:'G', name:'ANGLE', group:'meas', items:'1.10',
    gx:18, gy:0, w:1.9, d:1.9, h:5, form:'measure',
    means:'The angle sits inside the dot product already. Reading the sign is enough for most purposes: positive means the two vectors broadly agree, zero means perpendicular, negative means they oppose.',
    compute:'a · b = ‖a‖‖b‖cosθ, so cosθ = (a·b)/(‖a‖‖b‖). For a = [3,4] and b = [4,3], cosθ = 24/25 = 0.96. Take arccos for the angle itself.',
    watch:'a·b > 0 means θ < 90°, not θ < 0°. Zero means exactly perpendicular; negative means more than 90°.'
  },
  {
    id:'O', key:'O', name:'ORTHOGONALITY', group:'meas', items:'1.11',
    gx:21.6, gy:0, w:1.9, d:1.9, h:4.5, form:'measure',
    means:'Perpendicular, settled by one number. Since cos 90° = 0, the whole product a · b collapses to zero exactly when the vectors sit at right angles, so no trigonometry is needed to check.',
    compute:'a ⊥ b when a · b = 0. For [1,2] and [2,−1], 2 − 2 = 0, so they are perpendicular. A quick perpendicular to [x,y] is [−y,x].',
    watch:'The zero vector is technically orthogonal to everything, which is usually a degenerate case rather than a useful fact.'
  },
  {
    id:'Q', key:'Q', name:'COSINE SIMILARITY', group:'meas', items:'1.12',
    gx:18, gy:3.6, w:2, d:2, h:5.5, form:'measure',
    means:'A similarity score that ignores how long the vectors are. Dividing by both lengths cancels magnitude, which suits embeddings: a longer vector is not more of a word, only the direction carries meaning.',
    compute:'cosθ = (a·b)/(‖a‖‖b‖), the same formula as the angle. Values run from −1 to 1: one for the same direction, zero for perpendicular, minus one for opposite.',
    watch:'A high cosine similarity does not mean the vectors are close together. Two vectors of wildly different length can score 1.'
  },

  /* ---------------- NORMS (tall measurements) ---------------- */
  {
    id:'L1', key:'L1', name:'L1 NORM', group:'norms', items:'4.1',
    full:'the L1 norm, said "ell one", the sum of the absolute values',
    gx:24.5, gy:3.6, w:1.9, d:1.9, h:5, form:'measure',
    means:'Distance measured along the streets rather than through the buildings, which is where the names Manhattan and taxicab come from. The 1 in the name is the power each component is raised to before the sum, which is why it is written L1. Minimising with this norm drives components to exactly zero, so it is the one to reach for when you want a sparse answer.',
    compute:'‖v‖₁ = |v₁| + |v₂| + … + |vₙ|. The double bars ‖ ‖ mean the length of the vector, the subscript 1 says which norm, and |v₁| means the absolute value of the first component. For [3,−4] that is 3 + 4 = 7.',
    watch:'The L1 norm treats a step along one axis and a diagonal step differently. [3,0] and [3,4] are not equally “small”.',
    widget:'l1norm'
  },
  {
    id:'LI', key:'LI', name:'L∞ NORM', group:'norms', items:'4.2',
    full:'the L-infinity norm, said "ell infinity", the largest absolute value',
    gx:24, gy:7.6, w:1.9, d:1.9, h:4.5, form:'measure',
    means:'The worst case, reported on its own. Everything except the largest component is discarded, which suits questions about the biggest single error rather than the total. The ∞ symbol is infinity, the limit the power in the name is pushed to, and the norm is also called the maximum norm or the Chebyshev norm.',
    compute:'‖v‖∞ = max(|v₁|, |v₂|, …, |vₙ|), where max means take the largest of the listed numbers. For [3,−4] that is max(3,4) = 4.',
    watch:'It is blind to every component except the biggest. [5,0] and [5,1000] have the same L-infinity norm, a different shape from the ordinary straight-line norm L2.',
    widget:'linfnorm'
  },
  {
    id:'NC', key:'NC', name:'COMPARE NORMS', group:'norms', items:'4.3',
    gx:22, gy:10.2, w:2.4, d:2.4, h:2.4, form:'op',
    means:'The three norms disagree about what a unit circle looks like. L2, the ordinary straight-line norm, draws the round one; L1, the sum of absolute values, draws a diamond with corners on the axes; L-infinity, the largest absolute value, draws a square. Those corners are why L1 produces sparse answers and L2 does not.',
    compute:'For any vector, ‖v‖∞ ≤ ‖v‖₂ ≤ ‖v‖₁, that is, the largest-value norm is never bigger than the straight-line norm, which is never bigger than the sum-of-values norm. With [3,−4] the three give 4, 5 and 7.',
    watch:'These are not interchangeable. L1 shrinks large outliers less, L-infinity shrinks them more, and L2 sits between. Sparsity and robustness later depend on exactly this.',
    widget:'normcompare'
  },

  /* ---------------- THE SPACE (flat plates) ---------------- */
  {
    id:'W', key:'W', name:'VECTOR SPACE', group:'space', items:'1.15, 1.16',
    gx:0, gy:11, w:5, d:4, h:0.5, form:'structure',
    means:'The smallest set of rules that make the vector operations behave. R^n, meaning all lists of n real numbers, is the example you have been using all along, but matrices and polynomials obey the same rules, so anything proved here applies to them too.',
    compute:'Check the eight axioms: four for addition (commutative, associative, a zero vector, an inverse for each vector), two for multiplication and two distributive. A set fails if any operation escapes it.',
    watch:'You can add two vectors and scale a vector. You cannot multiply two vectors, and you cannot add a number to a vector.'
  },
  {
    id:'E', key:'E', name:'DIMENSION', group:'space', items:'1.17',
    gx:8.2, gy:16.6, w:3, d:2.5, h:0.6, form:'structure',
    means:'A count of directions, not of components. A line through the origin in R² has dimension 1 even though each vector on it carries two components, so the two numbers differ more often than not.',
    compute:'dim V, short for the dimension of V, is the number of vectors in any basis of V. A line through the origin in R² has a one-vector basis, so dim = 1 while the vectors on it still carry 2 components. Every basis of a given space has the same size.',
    watch:'Not the same as item 1.3. A vector’s dimension is its component count; a space’s dimension is its basis size. They often differ.'
  },
  {
    id:'B', key:'B', name:'BASIS', group:'space', items:'1.18',
    gx:0, gy:16.6, w:3, d:2.5, h:0.6, form:'structure',
    means:'A coordinate system in disguise. Once you fix a basis, every vector in the space has exactly one address in it, and independence is what guarantees that address is unique.',
    compute:'A basis spans the space and is linearly independent. The standard basis of R² is e₁ = [1,0] and e₂ = [0,1], so 3e₁ + 5e₂ = [3,5].',
    watch:'A space has infinitely many different bases, but they all contain the same number of vectors.'
  },
  {
    id:'I', key:'I', name:'INDEPENDENCE', group:'space', items:'1.19',
    gx:4.1, gy:16.6, w:3, d:2.5, h:0.6, form:'structure',
    means:'Nothing in the set repeats what the others already say. Two independent vectors in R² reach the whole plane while two dependent ones reach only a line, so independence decides how much of the space you can cover.',
    compute:'[1,0] and [0,1] are independent, since no scalar c gives c[1,0] = [0,1]. But [1,2] and [2,4] are dependent, because the second is twice the first. For two vectors in R², a zero determinant means dependent.',
    watch:'More than n vectors in R^n, the space of lists of n numbers, must be dependent, no matter what they are.'
  },
  {
    id:'R', key:'R', name:'THE RELATIONSHIP', group:'space', items:'1.20',
    gx:0, gy:20.5, w:6, d:2.5, h:0.5, form:'structure',
    means:'Four names for one situation. A basis has to hit the dimension exactly, because too few vectors cannot reach everywhere and too many cannot stay independent.',
    compute:'In R^n, fewer than n vectors never span and more than n are always dependent. To span is to reach every point in the space by combining the vectors. At exactly n, independent and spanning and basis all mean the same thing.',
    watch:'The basis theorem means that once you know the dimension you only need to check one of the two conditions, not both.'
  },

  /* ---------------- BUILDING WITH MATRICES ---------------- */
  {
    id:'MA', key:'MA', name:'ADD / SUBTRACT', group:'mops', items:'2.3, 2.4',
    gx:14, gy:12.5, w:2.5, d:2, h:1.3, form:'op',
    means:'The vector rule applied to a grid, with nothing new added. Entries only ever meet the entry in the matching position, which is why the two matrices must have identical shape.',
    compute:'(A + B)ⱼ,ₖ = aⱼ,ₖ + bⱼ,ₖ, and subtraction the same with a minus. [[1,2],[3,4]] + [[5,6],[7,8]] = [[6,8],[10,12]]. Undefined unless the sizes match.',
    watch:'Defined only when A and B are the same size. Same restriction as vector addition.'
  },
  {
    id:'MK', key:'MK', name:'SCALAR × MATRIX', group:'mops', items:'2.5',
    gx:17.5, gy:12.5, w:2.5, d:2, h:1.3, form:'op',
    means:'Scaling leaves the shape untouched, and that completes the picture. With addition and scaling both working entry by entry, the set of all m × n matrices is itself a vector space.',
    compute:'kA multiplies every entry by k. 3[[1,2],[3,4]] = [[3,6],[9,12]]. The size never changes.',
    watch:'No size restriction here. Any scalar works on any matrix.'
  },
  {
    id:'TR', key:'TR', name:'TRANSPOSE', group:'mops', items:'2.6',
    gx:21, gy:12.5, w:2.5, d:2.5, h:1.7, form:'op',
    means:'Bookkeeping for most of the subject, and load-bearing in one place. The transpose in QKᵀ is the only reason the inner dimensions of attention meet, so the operation earns its keep right at the end.',
    compute:'(Aᵀ)ⱼ,ₖ = Aₖ,ⱼ, where the superscript ᵀ means transpose and the subscripts j and k are the row and column numbers, so rows become columns. [[1,2,3],[4,5,6]] transposes to [[1,4],[2,5],[3,6]], turning 2 × 3 into 3 × 2. Transposing twice returns A.',
    watch:'Transposing changes the size unless the matrix is square. A 2 × 3 becomes a 3 × 2.'
  },

  /* ---------------- MULTIPLICATION ---------------- */
  {
    id:'MV', key:'MV', name:'MATRIX × VECTOR', group:'mult', items:'2.7',
    gx:14, gy:16.5, w:3, d:2.5, h:2.2, form:'op',
    means:'The operation the rest of the subject leans on. Reading Ax as a combination of the columns is what makes the set of all possible outputs the span of those columns, and that observation becomes the definition of rank.',
    compute:'Row view: entry i is row i dotted with x. Column view: Ax = x₁(col 1) + … + xₙ(col n). Sizes (m × n)(n × 1) = (m × 1), so x needs n components.',
    watch:'The vector’s length must equal the matrix’s column count. A 2 × 3 matrix can only eat a 3-component vector.',
    widget:'matvec'
  },
  {
    id:'VM', key:'VM', name:'VECTOR × MATRIX', group:'mult', items:'2.8',
    gx:18, gy:16.5, w:3, d:2.5, h:2.2, form:'op',
    means:'The mirror of the previous operation. A column vector on the right combines columns and a row vector on the left combines rows, so which side you sit on decides which you get.',
    compute:'[1,2] × [[1,2,3],[4,5,6]] = [9,12,15], which is also 1·[1,2,3] + 2·[4,5,6]. Sizes (1 × m)(m × n) = (1 × n).',
    watch:'xA and Ax are different operations, and usually only one of the two is even defined.'
  },
  {
    id:'MM', key:'MM', name:'MATRIX × MATRIX', group:'mult', items:'2.9',
    gx:22, gy:16.5, w:3.4, d:3, h:2.6, form:'op',
    means:'Two transformations composed and written as one. In AB the transformation B acts first and A second, so the product reads right to left, and AB rarely equals BA.',
    compute:'(AB)ⱼ,ₖ = (row j of A) · (column k of B). [[1,2],[3,4]] · [[5,6],[7,8]] = [[19,22],[43,50]]. Sizes (m × n)(n × r) = (m × r): the inner numbers match then vanish, the outer ones survive.',
    watch:'AB ≠ BA. Matrix multiplication is not commutative, and often only one order is even defined.'
  },

  /* ---------------- TRANSFORMATION ---------------- */
  {
    id:'X', key:'X', name:'GEOMETRIC MEANING', group:'xform', items:'2.10',
    gx:14, gy:20.8, w:4, d:3, h:1.6, form:'op',
    means:'A matrix is a function, and its columns record where the basis vectors land. Everything else follows from linearity: fix the images of e₁ and e₂ and you have fixed what happens to every other vector in the plane.',
    compute:'T(x) = Ax, with columns giving the input dimension and rows the output. To build a transformation, write the images of e₁ and e₂ as the columns. Rotation by 90° is [[0,−1],[1,0]] and reflection over the y-axis is [[−1,0],[0,1]].',
    watch:'Columns give the input dimension and rows the output, the opposite way round from how the size m × n is quoted.'
  },
  {
    id:'DR', key:'DR', name:'4D → 3D', group:'xform', items:'2.11',
    full:'four dimensions down to three, written R^4 → R^3',
    gx:19, gy:20.8, w:3, d:2, h:1.2, form:'op', slices:4,
    means:'Information leaves and does not come back. Several different four-component vectors land on the same three-component output, so once the collapse has happened no matrix can recover which one you started from.',
    compute:'Needs 4 columns and 3 rows, so a 3 × 4 matrix. Dropping the fourth row of the identity deletes the fourth component. Nullity, the number of independent directions the matrix sends to zero, is at least 1 whenever there are more columns than rows.',
    watch:'Irreversible. No matrix can recover the discarded component.'
  },
  {
    id:'DI', key:'DI', name:'4D → 6D', group:'xform', items:'2.12',
    full:'four dimensions up to six, written R^4 → R^6',
    gx:23, gy:20.8, w:3, d:2, h:1.2, form:'op', slices:6,
    means:'A larger output space holds no more information. Every output is a combination of the four columns, so the results fill a 4-dimensional slice of the 6-dimensional space and never the whole of it.',
    compute:'Needs 4 columns and 6 rows, so a 6 × 4 matrix. Rank is capped at 4 by the column count, whatever the entries are.',
    watch:'A bigger output space is not more information. This is the idea that becomes rank in section 5.'
  },

  /* ---------------- RANK & INFORMATION ---------------- */
  {
    id:'RK', key:'RK', name:'RANK', group:'rank', items:'5.1',
    gx:31.5, gy:22, w:1.8, d:1.8, h:4.5, form:'measure',
    means:'A count of how much a matrix knows. Size and rank are different things: a 1000 × 1000 matrix of rank 5 carries five directions of information and the rest is repetition.',
    compute:'rank A = the number of pivots in reduced row echelon form, often shortened to RREF. A pivot is the leading non-zero entry of a row once the matrix has been tidied into that staircase shape. For [[1,2],[3,4]] both columns are independent, so rank A = 2. Rank never exceeds min(m,n), the smaller of the row and column counts.',
    watch:'Rank counts independent directions, not entries. A huge matrix can still be rank 1, and a rank-1 matrix cannot carry more than one direction of information.',
    widget:'rank'
  },
  {
    id:'RS', key:'RS', name:'RANK & SPAN', group:'rank', items:'5.2, 5.3',
    gx:36.4, gy:22, w:5, d:3, h:0.5, form:'structure',
    means:'Rank measures the reachable space. The span of the columns is the set of every output the matrix can produce, and the dimension of that span is what rank counts.',
    compute:'Columns spanning a line give rank 1, a plane rank 2. For an m × n matrix, rank ≤ min(m,n), and rank + nullity = n, where nullity counts the independent directions the matrix flattens to zero.',
    watch:'Two different matrices can have the same span and the same rank even when their entries look completely different.',
    widget:'rankspan'
  },
  {
    id:'LO', key:'LO', name:'LORA', group:'rank', items:'5.4',
    full:'low-rank adaptation',
    gx:44, gy:22, w:2.4, d:2.4, h:2.4, form:'op',
    means:'Rank turned into a training budget. LoRA is short for low-rank adaptation. The bet is that the change a model needs is low rank even when the weight matrix is not, so a thin update captures it while the original weights stay frozen.',
    compute:'W_new = W + BA, where W is the original weight matrix, B has size (d × r), A has size (r × k), and r, the rank of the update, is much smaller than either d or k. The symbol ≪ means "much less than" and min(d,k) means the smaller of d and k. Trainable parameters fall from d×k to r(d+k). For d = k = 768 and r = 8 that is 12,288 instead of 589,824.',
    watch:'The rank r is the budget of new information. Too small and the update cannot represent what you need; too large and you have thrown away the point of the trick.',
    widget:'lora'
  },

  /* ---------------- PROJECTION ---------------- */
  {
    id:'PR', key:'PR', name:'PROJECTION', group:'proj', items:'6.1',
    gx:9.5, gy:24, w:2.2, d:2.2, h:2.2, form:'op',
    means:'The closest point available in a smaller space. Nothing on the line sits nearer to v than its shadow does, and the leftover piece is perpendicular to the line, which is what makes the shadow the best answer.',
    compute:'The projection onto the line through u is ((v·u)/(u·u))u. With u = [1,1] and v = [3,1], the scale is 4/2 = 2 and the shadow is [2,2].',
    watch:'Projecting loses the perpendicular part forever. You cannot recover v from its shadow alone, because the perpendicular part is gone.',
    widget:'projection'
  },
  {
    id:'PF', key:'PF', name:'PROJECTION FORMULA', group:'proj', items:'6.2, 6.3',
    gx:29.3, gy:24, w:2.2, d:2.2, h:2.2, form:'op',
    means:'A ruler and a reading. Dividing by u·u turns u into a unit ruler, and the dot product v·u reads off how far v reaches along it, so the two pieces together give the shadow.',
    compute:'proj_u(v) = ((v·u)/(u·u))u, read "the projection of v onto u". The dot · is the dot product. When u is already a unit vector, one of length exactly 1, the denominator is 1 and the formula shortens to (v·û)û, where the hat on û marks it as that unit vector.',
    watch:'The formula always returns a multiple of u, so it must lie on the line. If v is already on the line, it returns v unchanged.',
    widget:'projformula'
  },
  {
    id:'PI', key:'PI', name:'WHY PROJECTION MATTERS', group:'proj', items:'6.4, 6.5',
    gx:48.1, gy:24, w:4, d:3, h:0.5, form:'structure',
    means:'Replacing a point with the best available stand-in. Least squares is this idea applied to data that refuses to fit, and principal component analysis, PCA, opens by asking which line to project a whole cloud onto.',
    compute:'The residual, meaning what is left over, is v − proj_u(v), and minimising its length is the least-squares problem. Here proj_u(v) is read "the projection of v onto u". By Pythagoras ‖proj‖² + ‖residual‖² = ‖v‖², so keeping the most and losing the least are one goal.',
    watch:'“Best” means closest in Euclidean distance, which is a choice. Other norms give different best approximations.',
    widget:'whyproj'
  },

  /* ---------------- EIGENVALUES & PCA ---------------- */
  {
    id:'EV', key:'EV', name:'EIGENVECTOR', group:'eigen', items:'7.1, 7.2, 7.4',
    gx:0, gy:28, w:2.2, d:2.2, h:2.2, form:'op',
    means:'A direction the matrix leaves alone. Most vectors get turned as well as stretched, and the eigenvectors are the exceptions where only the length changes.',
    compute:'Av = λv, with v non-zero. The Greek letter λ is lambda, the eigenvalue, and the equation reads "A applied to v gives back a scalar multiple of v". To test a candidate, multiply and check the answer is a multiple of the input. For [[2,2],[−4,8]], v = [1,1] gives [4,4] = 4v.',
    watch:'Most vectors do get turned. Only very special directions are eigenvectors, and a matrix may have none (over the reals) or several.',
    widget:'eigen'
  },
  {
    id:'EC', key:'EC', name:'EIGENVALUE & CALCULATION', group:'eigen', items:'7.3, 7.5',
    gx:9.3, gy:28, w:1.8, d:1.8, h:4.5, form:'measure',
    means:'The stretch factor that arrives with each eigenvector. Its sign and size say what happened: a negative value flips the direction, magnitude above 1 grows, below 1 shrinks, and zero collapses the direction entirely.',
    compute:'Solve det(A − λI) = 0 for the eigenvalues, then solve (A − λI)v = 0 for each one. Here det is the determinant, λ is lambda the eigenvalue, and I is the identity matrix, the one with ones down the diagonal that leaves any vector unchanged. For [[2,1],[1,2]] the polynomial is λ² − 4λ + 3, giving λ = 3 and λ = 1.',
    watch:'The zero vector always satisfies Av = λv but is not an eigenvector. Eigenvectors must be non-zero.',
    widget:'eigencalc'
  },
  {
    id:'PD', key:'PD', name:'PCA IN DEPTH', group:'eigen', items:'7.6',
    full:'principal component analysis',
    gx:15.2, gy:28, w:5, d:3, h:0.5, form:'structure',
    means:'The search for the line a cloud of data spreads along. PCA is short for principal component analysis, and a principal component is one of those directions of spread. Maximising the spread turns out to be an eigenvector problem, which is why the covariance matrix appears: its eigenvectors are the directions and its eigenvalues are the variance each one carries.',
    compute:'Centre the data, build the covariance matrix, then take its eigenvectors sorted by eigenvalue. Covariance measures how much two coordinates move together, and variance is the spread of one coordinate on its own. The largest eigenvalue gives the first principal component, written PC1, and the next gives PC2. Covariance is symmetric, so the components come out perpendicular.',
    watch:'Eigenvectors are directions, not axes you choose. Principal component analysis always finds the same axes for the same data, up to sign.',
    widget:'pca'
  },

  /* ---------------- SVD & LOW-RANK ---------------- */
  {
    id:'SV', key:'SV', name:'SVD', group:'svd', items:'8.1',
    full:'singular value decomposition',
    gx:23, gy:28, w:2.4, d:2.4, h:2.4, form:'op',
    means:'The decomposition that works when eigenvectors will not. SVD is short for singular value decomposition, and to decompose a matrix is to write it as a product of simpler ones. Eigenvalues need a square matrix and can still fail, while every matrix without exception has a singular value decomposition, which is why it carries so much of applied linear algebra.',
    compute:'A = UΣVᵀ, said "U sigma V transposed". U and V are orthogonal, meaning their columns are perpendicular unit vectors, so they only rotate or reflect. The capital Greek letter Σ is sigma; here it is a diagonal matrix holding the singular values, not a summation sign. The superscript ᵀ means transpose, rows and columns swapped. For an m × n matrix, U is m × m, Σ is m × n and Vᵀ is n × n.',
    watch:'U and Vᵀ are not the same. The first is a change of output basis, the second a change of input basis.',
    widget:'svd'
  },
  {
    id:'SG', key:'SG', name:'SVD GEOMETRY', group:'svd', items:'8.2, 8.3',
    full:'the singular value decomposition seen as a picture',
    gx:31, gy:28, w:4, d:3, h:0.5, form:'structure',
    means:'Every matrix does the same three things in the same order. A circle always comes out as an ellipse, because the stretching happens along fixed axes and the two rotations only decide where those axes end up pointing.',
    compute:'Read A = UΣVᵀ right to left. Vᵀ rotates the input, Σ scales axis i by σᵢ, U rotates into the output space. The lower-case Greek letter σ is sigma, and σᵢ is the i-th singular value, the amount of stretch along axis i. The σᵢ are the semi-axis lengths of the ellipse, meaning the distances from its centre to its ends, and the columns of U are its axes.',
    watch:'The order matters and cannot be swapped. Rotate → scale → rotate is what the factors literally say.',
    widget:'svdgeom'
  },
  {
    id:'SP', key:'SP', name:'LOW-RANK & PIXELS', group:'svd', items:'8.4, 8.5',
    full:'approximating an image with only its largest singular values',
    gx:40.6, gy:28, w:3, d:2.4, h:0.85, form:'object', grid:[2,3],
    means:'Photographs turn out to be close to low rank without anyone arranging it. Their singular values fall away quickly, so a few layers carry most of the picture. The Eckart-Young theorem, named after Carl Eckart and Gale Young, proves that truncating the singular value decomposition, meaning cutting it off after the first k terms, is the best rank-k approximation available.',
    compute:'A ≈ U_k Σ_k V_kᵀ, where the subscript k means "keep only the first k columns" and ≈ means approximately equal. Keeping the top k singular values drops storage from 1,000,000 numbers to k(1000 + 1000 + 1). At k = 100 that is 200,100, or 20% of the original.',
    watch:'Low rank is an approximation. The dropped singular values are information you chose to throw away.',
    widget:'svdpixels'
  },

  /* ---------------- ATTENTION ---------------- */
  {
    id:'QK', key:'QK', name:'Q, K, V', group:'attn', items:'9.1, 9.2',
    full:'query, key and value',
    gx:3, gy:31.5, w:4, d:2.5, h:0.9, form:'object', layers:3,
    means:'Three different questions asked of the same tokens. Q stands for query, K for key and V for value. A token is one piece of the input, a word or part of a word. A query says what a token is looking for and a key says what it offers, so those two settle the weights; the value is the content that moves.',
    compute:'Q = XW_Q, K = XW_K, V = XW_V, all linear maps of the same X. X is the stack of input tokens, one per row, and W_Q, W_K and W_V are the learned weight matrices that produce the query, key and value. With X of size (n × d), where n is the number of tokens and d the size of each one, Q and K come out (n × d_k) and V comes out (n × d_v). Here d_k is the width of a query or key, and d_v the width of a value.',
    watch:'Query, key and value are different projections of the same input. They are not three separate inputs.',
    widget:'qkv'
  },
  {
    id:'QT', key:'QT', name:'QKᵀ & SCALING', group:'attn', items:'9.3, 9.4',
    full:'the query matrix times the transposed key matrix, then divided by √d_k',
    gx:28.6, gy:31.5, w:2, d:2, h:2, form:'op',
    means:'Scores for every pair, and a correction for scale. QKᵀ is the query matrix times the key matrix transposed. Without that transpose the inner dimensions never meet, and without the division the scores grow with d_k, the width of a key, until softmax saturates, meaning it hands nearly all the weight to one entry, and the gradients vanish.',
    compute:'S = QKᵀ / √d_k, where S is the matrix of scores. Sizes (n × d_k)(d_k × n) = (n × n), one score per query-key pair. Entry (i,j) is qᵢ · kⱼ, the dot product of query i with key j.',
    watch:'Without the transpose the shapes do not match. Without dividing by √d_k, the square root of the key width, softmax gets pushed into saturation for large d_k.',
    widget:'qkt'
  },
  {
    id:'SM', key:'SM', name:'SOFTMAX', group:'attn', items:'9.5',
    full:'the soft maximum, which turns scores into probabilities',
    gx:38.7, gy:31.5, w:2, d:2, h:2, form:'op',
    means:'Scores turned into weights that behave like probabilities. The name is short for soft maximum: a hard maximum would give all the weight to the winner, while this one shares it out. The exponential exaggerates differences so the largest score dominates, and nothing ever reaches zero, which keeps the whole operation differentiable, meaning it has a well-defined slope everywhere so training can follow it.',
    compute:'softmax(z)ᵢ = e^zᵢ / Σⱼ e^zⱼ. Read that as: raise e, the number 2.71828…, to the power of each score, then divide each result by the total of all of them. Here the capital Σ is a summation sign and the subscript j means "add over every entry". For [2,1,0] the result is [0.665, 0.245, 0.090]. Subtract the row maximum before exponentiating to avoid overflow, meaning numbers too large for the computer to hold; the answer is unchanged.',
    watch:'Softmax is not a hard max. It always gives some weight to everyone, and exponentiating makes large scores dominate sharply.',
    widget:'softmax'
  },
  {
    id:'AT', key:'AT', name:'FULL ATTENTION', group:'attn', items:'9.6',
    gx:44.3, gy:31.5, w:5, d:3, h:0.5, form:'structure',
    means:'A lookup where nothing is chosen outright. Every token reads a weighted blend of all the values rather than picking one, which keeps the operation differentiable and lets a single matrix multiplication serve a whole sequence.',
    compute:'Attention(Q,K,V) = softmax(QKᵀ/√d_k)V, with Q the queries, K the keys and V the values. Four steps: score with QKᵀ, divide by √d_k, apply softmax to each row, multiply by V. The output is (n × d_v), one value-width row per token.',
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
