import { ChangeEvent, useState } from "react";
import { Field, useFormikContext, FormikState } from 'formik'
import { ModeloMueble } from "../types";
const FileUpload = (props: { field: typeof Field; modelId: number; values: any }) => {
    const [imgSize, setImgSize] = useState(0);
    const { field } = props;
    const { modelId } = props;
    const { values } = props;


    const formik = useFormikContext();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.currentTarget.files) {
            alert("files null")
            return;
        }
        console.log(modelId)


        const file = e.currentTarget.files[0];
        const reader = new FileReader();
        const imgTag = document.getElementById("myimage"+modelId) as HTMLImageElement;
        imgTag.title = file.name;

        reader.onload = function (event) {
            imgTag.src = event.target?.result as string;
            setImgSize(200)
        };
        reader.readAsDataURL(file);
        values.models[modelId-1].img = file;
        formik.setFieldValue(field.name, file);

    };

    //form.setFieldValue is a type of function that comes from Formik
    return (
        <div>
            <input type='file' onChange={(o) => handleChange(o)}
                className="form-control m-2" />
            {<img src={''} alt="" className="img-fluid p-2" id={'myimage'+modelId} width={imgSize} height={imgSize} />}
        </div>
    );
}




export default FileUpload;