"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertOk = exports.ErrResponse = exports.env = void 0;
const prodSpec = __importStar(require("../spec/env/prod.json"));
const gammaSpec = __importStar(require("../spec/env/gamma.json"));
const betaSpec = __importStar(require("../spec/env/beta.json"));
exports.env = {
    prod: prodSpec["Dev-CubeSignerStack"],
    gamma: gammaSpec["Dev-CubeSignerStack"],
    beta: betaSpec["Dev-CubeSignerStack"],
};
/**
 * Error response type, thrown on non-successful responses.
 */
class ErrResponse extends Error {
    /**
     * Constructor
     * @param {Partial<ErrResponse>} init Initializer
     */
    constructor(init) {
        super(init.message);
        Object.assign(this, init);
    }
}
exports.ErrResponse = ErrResponse;
/**
 * Throw if on error response. Otherwise, return the response data.
 * @param {ResponseType} resp The response to check
 * @param {string} description Description to include in the thrown error
 * @return {D} The response data.
 * @internal
 */
function assertOk(resp, description) {
    if (resp.error) {
        throw new ErrResponse({
            description,
            message: resp.error.message,
            statusText: resp.response?.statusText,
            status: resp.response?.status,
        });
    }
    if (resp.data === undefined) {
        throw new Error("Response data is undefined");
    }
    return resp.data;
}
exports.assertOk = assertOk;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Vudi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGdFQUFrRDtBQUNsRCxrRUFBb0Q7QUFDcEQsZ0VBQWtEO0FBa0JyQyxRQUFBLEdBQUcsR0FBc0M7SUFDcEQsSUFBSSxFQUFFLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQztJQUNyQyxLQUFLLEVBQUUsU0FBUyxDQUFDLHFCQUFxQixDQUFDO0lBQ3ZDLElBQUksRUFBRSxRQUFRLENBQUMscUJBQXFCLENBQUM7Q0FDdEMsQ0FBQztBQUlGOztHQUVHO0FBQ0gsTUFBYSxXQUFZLFNBQVEsS0FBSztJQVFwQzs7O09BR0c7SUFDSCxZQUFZLElBQTBCO1FBQ3BDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDNUIsQ0FBQztDQUNGO0FBaEJELGtDQWdCQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQWdCLFFBQVEsQ0FBTyxJQUF3QixFQUFFLFdBQW9CO0lBQzNFLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtRQUNkLE1BQU0sSUFBSSxXQUFXLENBQUM7WUFDcEIsV0FBVztZQUNYLE9BQU8sRUFBRyxJQUFJLENBQUMsS0FBYSxDQUFDLE9BQU87WUFDcEMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVTtZQUNyQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNO1NBQzlCLENBQUMsQ0FBQztLQUNKO0lBQ0QsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtRQUMzQixNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7S0FDL0M7SUFDRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDbkIsQ0FBQztBQWJELDRCQWFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcHJvZFNwZWMgZnJvbSBcIi4uL3NwZWMvZW52L3Byb2QuanNvblwiO1xuaW1wb3J0ICogYXMgZ2FtbWFTcGVjIGZyb20gXCIuLi9zcGVjL2Vudi9nYW1tYS5qc29uXCI7XG5pbXBvcnQgKiBhcyBiZXRhU3BlYyBmcm9tIFwiLi4vc3BlYy9lbnYvYmV0YS5qc29uXCI7XG5cbmV4cG9ydCB0eXBlIEVudmlyb25tZW50ID1cbiAgLyoqIFByb2R1Y3Rpb24gZW52aXJvbm1lbnQgKi9cbiAgfCBcInByb2RcIlxuICAvKiogR2FtbWEsIHN0YWdpbmcgZW52aXJvbm1lbnQgKi9cbiAgfCBcImdhbW1hXCJcbiAgLyoqIEJldGEsIGRldmVsb3BtZW50IGVudmlyb25tZW50ICovXG4gIHwgXCJiZXRhXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW52SW50ZXJmYWNlIHtcbiAgQ2xpZW50SWQ6IHN0cmluZztcbiAgTG9uZ0xpdmVkQ2xpZW50SWQ6IHN0cmluZztcbiAgUmVnaW9uOiBzdHJpbmc7XG4gIFVzZXJQb29sSWQ6IHN0cmluZztcbiAgU2lnbmVyQXBpUm9vdDogc3RyaW5nO1xufVxuXG5leHBvcnQgY29uc3QgZW52OiBSZWNvcmQ8RW52aXJvbm1lbnQsIEVudkludGVyZmFjZT4gPSB7XG4gIHByb2Q6IHByb2RTcGVjW1wiRGV2LUN1YmVTaWduZXJTdGFja1wiXSxcbiAgZ2FtbWE6IGdhbW1hU3BlY1tcIkRldi1DdWJlU2lnbmVyU3RhY2tcIl0sXG4gIGJldGE6IGJldGFTcGVjW1wiRGV2LUN1YmVTaWduZXJTdGFja1wiXSxcbn07XG5cbnR5cGUgUmVzcG9uc2VUeXBlPEQsIFQ+ID0geyBkYXRhPzogRDsgZXJyb3I/OiBUOyByZXNwb25zZT86IFJlc3BvbnNlIH07XG5cbi8qKlxuICogRXJyb3IgcmVzcG9uc2UgdHlwZSwgdGhyb3duIG9uIG5vbi1zdWNjZXNzZnVsIHJlc3BvbnNlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEVyclJlc3BvbnNlIGV4dGVuZHMgRXJyb3Ige1xuICAvKiogRGVzY3JpcHRpb24gKi9cbiAgcmVhZG9ubHkgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gIC8qKiBIVFRQIHN0YXR1cyBjb2RlIHRleHQgKGRlcml2ZWQgZnJvbSBgdGhpcy5zdGF0dXNgKSAqL1xuICByZWFkb25seSBzdGF0dXNUZXh0Pzogc3RyaW5nO1xuICAvKiogSFRUUCBzdGF0dXMgY29kZSAqL1xuICByZWFkb25seSBzdGF0dXM/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSB7UGFydGlhbDxFcnJSZXNwb25zZT59IGluaXQgSW5pdGlhbGl6ZXJcbiAgICovXG4gIGNvbnN0cnVjdG9yKGluaXQ6IFBhcnRpYWw8RXJyUmVzcG9uc2U+KSB7XG4gICAgc3VwZXIoaW5pdC5tZXNzYWdlKTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIGluaXQpO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3cgaWYgb24gZXJyb3IgcmVzcG9uc2UuIE90aGVyd2lzZSwgcmV0dXJuIHRoZSByZXNwb25zZSBkYXRhLlxuICogQHBhcmFtIHtSZXNwb25zZVR5cGV9IHJlc3AgVGhlIHJlc3BvbnNlIHRvIGNoZWNrXG4gKiBAcGFyYW0ge3N0cmluZ30gZGVzY3JpcHRpb24gRGVzY3JpcHRpb24gdG8gaW5jbHVkZSBpbiB0aGUgdGhyb3duIGVycm9yXG4gKiBAcmV0dXJuIHtEfSBUaGUgcmVzcG9uc2UgZGF0YS5cbiAqIEBpbnRlcm5hbFxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0T2s8RCwgVD4ocmVzcDogUmVzcG9uc2VUeXBlPEQsIFQ+LCBkZXNjcmlwdGlvbj86IHN0cmluZyk6IEQge1xuICBpZiAocmVzcC5lcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJSZXNwb25zZSh7XG4gICAgICBkZXNjcmlwdGlvbixcbiAgICAgIG1lc3NhZ2U6IChyZXNwLmVycm9yIGFzIGFueSkubWVzc2FnZSwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICBzdGF0dXNUZXh0OiByZXNwLnJlc3BvbnNlPy5zdGF0dXNUZXh0LFxuICAgICAgc3RhdHVzOiByZXNwLnJlc3BvbnNlPy5zdGF0dXMsXG4gICAgfSk7XG4gIH1cbiAgaWYgKHJlc3AuZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiUmVzcG9uc2UgZGF0YSBpcyB1bmRlZmluZWRcIik7XG4gIH1cbiAgcmV0dXJuIHJlc3AuZGF0YTtcbn1cbiJdfQ==