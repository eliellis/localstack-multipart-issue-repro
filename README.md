# Localstack S3 Multi-Part Upload Issue

When uploading to S3 using the JS AWS SDK v3 through localstack, a multi-part upload fails with the following error:

```bash
InternalError: exception while calling s3.UploadPart: Traceback (most recent call last):
  File "/opt/code/localstack/.venv/lib/python3.10/site-packages/localstack/aws/chain.py", line 90, in handle
    handler(self, self.context, response)
  File "/opt/code/localstack/.venv/lib/python3.10/site-packages/localstack/aws/handlers/service.py", line 123, in __call__
    handler(chain, context, response)
  File "/opt/code/localstack/.venv/lib/python3.10/site-packages/localstack/aws/handlers/service.py", line 93, in __call__
    skeleton_response = self.skeleton.invoke(context)
  File "/opt/code/localstack/.venv/lib/python3.10/site-packages/localstack/aws/skeleton.py", line 154, in invoke
    return self.dispatch_request(context, instance)
  File "/opt/code/localstack/.venv/lib/python3.10/site-packages/localstack/aws/skeleton.py", line 166, in dispatch_request
    result = handler(context, instance) or {}
  File "/opt/code/localstack/.venv/lib/python3.10/site-packages/localstack/aws/forwarder.py", line 67, in _call
    return fallthrough_handler(context, req)
  File "/opt/code/localstack/.venv/lib/python3.10/site-packages/localstack/services/moto.py", line 83, in _proxy_moto
    return call_moto(context)
  File "/opt/code/localstack/.venv/lib/python3.10/site-packages/localstack/services/moto.py", line 46, in call_moto
    return dispatch_to_backend(context, dispatch_to_moto, include_response_metadata)
  File "/opt/code/localstack/.venv/lib/python3.10/site-packages/localstack/aws/forwarder.py", line 120, in dispatch_to_backend
    http_response = http_request_dispatcher(context)
  File "/opt/code/localstack/.venv/lib/python3.10/site-packages/localstack/services/moto.py", line 111, in dispatch_to_moto
    response = dispatch(request, request.url, request.headers)
  File "/opt/code/localstack/.venv/lib/python3.10/site-packages/localstack/utils/patch.py", line 38, in proxy
    return new(target, *args, **kwargs)
  File "/opt/code/localstack/.venv/lib/python3.10/site-packages/localstack/services/s3/provider.py", line 1360, in _fix_key_response
    status_code, resp_headers, key_value = fn(self, *args, **kwargs)
  File "/opt/code/localstack/.venv/lib/python3.10/site-packages/moto/utilities/aws_headers.py", line 64, in _wrapper
    response = f(*args, **kwargs)
  File "/opt/code/localstack/.venv/lib/python3.10/site-packages/moto/s3/responses.py", line 1131, in key_response
    response = self._key_response(request, full_url, self.headers)
  File "/opt/code/localstack/.venv/lib/python3.10/site-packages/moto/s3/responses.py", line 1241, in _key_response
    return self._key_response_put(request, body, bucket_name, query, key_name)
  File "/opt/code/localstack/.venv/lib/python3.10/site-packages/moto/s3/responses.py", line 1422, in _key_response_put
    key = self.backend.upload_part(
  File "/opt/code/localstack/.venv/lib/python3.10/site-packages/moto/s3/models.py", line 2099, in upload_part
    multipart = bucket.multiparts[multipart_id]
KeyError: '4i0RHIsYtQgEgsFhDkkH485I5NR0s3VYInXEx6jI5rcoO3IUMA6nyCw' # <- UploadId taken from CreateMultipartUpload
```

This only occurs if `PERSISTENCE` is `0` and `S3_DIR` is set.

## Repro instructions

Assume you have a `.env` file in the root of the checkout folder with the following contents:

```bash
LOCALSTACK_API_KEY=XXXXXX
```

1. Run `npm i`
2. Run `docker compose --env-file=./.env -f ./docker-compose.s3-dir.yml up`
3. Run `npm run start` (this will generate a 5MB junk file and 10MB junk file and then run the repro)

Performing the above, but instead using `docker-compose.persistence.yml` (which does not set `S3_DIR`) will result in a successful upload.
