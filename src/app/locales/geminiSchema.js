import { Type } from "@google/genai";

export const JSON_PATCH_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        required: ["op", "path", "entityType", "value"],
        properties: {
            op: {
                type: Type.STRING,
                enum: ["add", "remove", "replace"]
            },

            path: {
                type: Type.STRING
            },

            entityType: {
                type: Type.STRING,
                enum: ["node", "edge"]
            },

            value: {
                type: Type.OBJECT,
                properties: {
                    /** ---------------- NODE ---------------- */
                    node: {
                        type: Type.OBJECT,
                        required: ["id", "type", "data"],
                        properties: {
                            id: { type: Type.STRING },

                            type: {
                                type: Type.STRING,
                                enum: ["groupNode", "textNode", "notesNode", "imageNode"]
                            },

                            parentId: { type: Type.STRING },

                            position: {
                                type: Type.OBJECT,
                                required: ["x", "y"],
                                properties: {
                                    x: { type: Type.NUMBER },
                                    y: { type: Type.NUMBER }
                                }
                            },

                            extent: {
                                type: Type.STRING,
                                enum: ["parent"]
                            },

                            data: {
                                type: Type.OBJECT,
                                required: ["label"],
                                properties: {
                                    label: { type: Type.STRING },
                                    use_case: { type: Type.STRING },
                                    src: { type: Type.STRING },
                                    color: { type: Type.STRING },
                                    textColor: { type: Type.STRING }
                                }
                            }
                        }
                    },

                    /** ---------------- EDGE ---------------- */
                    edge: {
                        type: Type.OBJECT,
                        required: ["id", "source", "target"],
                        properties: {
                            id: { type: Type.STRING },
                            source: { type: Type.STRING },
                            target: { type: Type.STRING },
                            label: { type: Type.STRING },
                            type: {
                                type: Type.STRING,
                                enum: ["default", "smoothstep", "step"]
                            }
                        }
                    }
                }
            }
        }
    }
};
