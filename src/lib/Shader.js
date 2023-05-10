export const define = `
#ifdef EMISSIVEMAP_UV
	#undef EMISSIVEMAP_UV
#endif
#define EMISSIVEMAP_UV vEmissiveMapUv
`;

export const uniforms = `
uniform float _Brake;
uniform float _Energy;
uniform float _BreakHeat;
uniform float _SelfIllumination;
uniform float _Lights;
uniform float _Turbo;
uniform float _ExhaustHeat;
uniform float _Boost;
uniform float _SelfIlluminationNight;
`

export const emission = /* glsl */`
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv);
	float breakStart = 0.0f;
    float breakRange = (32.0f * _Brake) / 255.0f;
    float energyStart = 32.0f / 255.0f;
    float energyRange = (32.0f * _Energy) / 255.0f;
    float breakHeatStart = 64.0f / 255.0f;
    float breakHeatRange = (32.0f * _BreakHeat) / 255.0f;
    float selfIlluminationStart = 96.0f / 255.0f;
    float selfIlluminationRange = (32.0f * _SelfIllumination) / 255.0f;
    float lightsStart = 128.0f / 255.0f;
    float lightsRange = (32.0f * _Lights) / 255.0f;
    float turboStart = 160.0f / 255.0f;
    float turboRange = (32.0f * _Turbo) / 255.0f;
    float exhaustHeatStart = 192.0f / 255.0f;
    float exhaustHeatRange = (32.0f * _ExhaustHeat) / 255.0f;
    float boostStart = 224.0f / 255.0f;
    float boostRange = (32.0f * _Boost) / 255.0f;
    if(emissiveColor.a >= breakStart && emissiveColor.a < breakStart + breakRange)
	{
	    emissiveColor.rgb = emissiveColor.rgb * _Brake;
	}
	else if(emissiveColor.a >= energyStart && emissiveColor.a < energyStart + energyRange)
	{
	    emissiveColor.rgb = emissiveColor.rgb * _Energy;
	}
	else if(emissiveColor.a >= breakHeatStart && emissiveColor.a < breakHeatStart + breakHeatRange)
	{
	    emissiveColor.rgb = emissiveColor.rgb * _BreakHeat;
	}
	else if(emissiveColor.a >= selfIlluminationStart && emissiveColor.a < selfIlluminationStart + selfIlluminationRange)
	{
	    emissiveColor.rgb = emissiveColor.rgb * _SelfIllumination;
	}
	else if(emissiveColor.a >= lightsStart && emissiveColor.a < lightsStart + lightsRange)
	{
	    emissiveColor.rgb = emissiveColor.rgb * _Lights;
	}
	else if(emissiveColor.a >= turboStart && emissiveColor.a < turboStart + turboRange)
	{
	    emissiveColor.rgb = emissiveColor.rgb * _Turbo;
	}
	else if(emissiveColor.a >= exhaustHeatStart && emissiveColor.a < exhaustHeatStart + exhaustHeatRange)
	{
	    emissiveColor.rgb = emissiveColor.rgb * _ExhaustHeat;
	}
	else if(emissiveColor.a >= boostStart && emissiveColor.a < boostStart + boostRange)
	{
	    emissiveColor.rgb = emissiveColor.rgb * _Boost;
	}
	else if(emissiveColor.a == 1.0f)
	{
	    emissiveColor.rgb = emissiveColor.rgb * _SelfIlluminationNight;
	}
	else
	{
	    emissiveColor = vec4(0.0f, 0.0f, 0.0f, 0.0f);
	}
	emissiveColor.a = 1.0f;
	totalEmissiveRadiance *= emissiveColor.rgb;
`;


export const normals = /* glsl */`

#ifdef USE_NORMALMAP_OBJECTSPACE

    vec4 mapN = texture2D( normalMap, vNormalMapUv );
    mapN.y = 1.0 - mapN.y;
	normal = mapN.xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals

	#ifdef FLIP_SIDED

		normal = - normal;

	#endif

	#ifdef DOUBLE_SIDED

		normal = normal * faceDirection;

	#endif

	normal = normalize( normalMatrix * normal );

#elif defined( USE_NORMALMAP_TANGENTSPACE )

    vec4 mapN = texture2D( normalMap, vNormalMapUv );
	mapN.xy *= normalScale;
    mapN.y = 1.0 - mapN.y;
	//mapN.xyz = mapN.xyz * 2.0 - 1.0;

	normal = normalize( tbn * -(mapN.xyz * 2.0 - 1.0) );

#elif defined( USE_BUMPMAP )

	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );

#endif
    //Flip the green channel to account for the normal map being in object space
    
`;