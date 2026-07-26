import { useState } from "react";
import { Link } from "react-router-dom";


import {
  getDocumentsByProperty,
  registerDocument,
  uploadDocument,
  verifyDocument,
  rejectDocument
} from "../../services/documentService";



function Documents() {


  const user =
    JSON.parse(
      localStorage.getItem("user")
    );



  const [propertyId, setPropertyId] = useState("");

  const [documents, setDocuments] = useState([]);

  const [file, setFile] = useState(null);

  const [selectedDocumentId, setSelectedDocumentId] = useState("");

  const [form, setForm] = useState({

    documentName: "",

    documentType: ""

  });


  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");







  const searchDocuments = async () => {

    try {

      setLoading(true);

      setError("");



      const response =
        await getDocumentsByProperty(propertyId);



      setDocuments(
        response.data || []
      );


    }
    catch(error) {

      setError(
        error.response?.data?.message ||
        "Failed to load documents"
      );

    }
    finally {

      setLoading(false);

    }

  };








  const handleRegister = async () => {


    try {


      setError("");



      await registerDocument({

        propertyId,

        documentName:
          form.documentName,

        documentType:
          form.documentType,

        uploadedBy:
          user?.walletAddress

      });



      setForm({

        documentName:"",

        documentType:""

      });



      await searchDocuments();


    }
    catch(error){


      setError(

        error.response?.data?.message ||
        error.message

      );


    }


  };









  const handleUpload = async () => {


    try {


      if(!file || !selectedDocumentId){

        setError(
          "Select document and file first"
        );

        return;

      }



      await uploadDocument(

        selectedDocumentId,

        file

      );



      setFile(null);

      setSelectedDocumentId("");



      await searchDocuments();


    }
    catch(error){


      setError(

        error.response?.data?.message ||
        error.message

      );


    }


  };









  const handleVerify = async (documentId) => {


    try {


      await verifyDocument(
        documentId
      );


      await searchDocuments();


    }
    catch(error){


      setError(
        error.response?.data?.message ||
        error.message
      );


    }


  };









  const handleReject = async (documentId) => {


    try {


      await rejectDocument(
        documentId
      );


      await searchDocuments();


    }
    catch(error){


      setError(
        error.response?.data?.message ||
        error.message
      );


    }


  };









  return (

    <div>


      <h1>
        Documents
      </h1>





      {
        user?.role === "owner" &&

        <>

        <h2>
          Register Document
        </h2>



        <input

          placeholder="Property ID"

          value={propertyId}

          onChange={(e)=>
            setPropertyId(e.target.value)
          }

        />



        <input

          placeholder="Document Name"

          value={
            form.documentName
          }

          onChange={(e)=>

            setForm({

              ...form,

              documentName:
                e.target.value

            })

          }

        />




        <input

          placeholder="Document Type"

          value={
            form.documentType
          }

          onChange={(e)=>

            setForm({

              ...form,

              documentType:
                e.target.value

            })

          }

        />




        <button
          onClick={handleRegister}
        >

          Register

        </button>


        </>

      }









      <h2>
        Search Documents
      </h2>




      <input

        placeholder="Property ID"

        value={propertyId}

        onChange={(e)=>
          setPropertyId(e.target.value)
        }

      />




      <button
        onClick={searchDocuments}
      >

        Search

      </button>







      {
        loading &&
        <h3>
          Loading...
        </h3>
      }






      {
        error &&
        <h3>
          {error}
        </h3>
      }







      {
        user?.role === "owner" &&

        <>

        <h3>
          Upload Document
        </h3>



        <select

          value={selectedDocumentId}

          onChange={(e)=>
            setSelectedDocumentId(
              e.target.value
            )
          }

        >


          <option value="">
            Select Document
          </option>



          {
            documents.map((document)=>(

              <option

                key={
                  document.documentId
                }

                value={
                  document.documentId
                }

              >

                {
                  document.documentName
                }

              </option>


            ))

          }


        </select>





        <input

          type="file"

          onChange={(e)=>
            setFile(
              e.target.files[0]
            )
          }

        />





        <button

          onClick={handleUpload}

        >

          Upload

        </button>


        </>

      }









      <table border="1">


        <thead>


          <tr>

            <th>ID</th>

            <th>Name</th>

            <th>Type</th>

            <th>Uploaded By</th>

            <th>Status</th>

            <th>IPFS</th>

            <th>Actions</th>

          </tr>


        </thead>






        <tbody>



          {
            documents.map((document)=>(



              <tr

                key={
                  document.documentId
                }

              >



                <td>

                  {
                    document.documentId
                  }

                </td>



                <td>

                  {
                    document.documentName
                  }

                </td>



                <td>

                  {
                    document.documentType
                  }

                </td>



                <td>

                  {
                    document.uploadedBy
                  }

                </td>



                <td>

                  {
                    document.status
                  }

                </td>



                <td>

                  {
                    document.documentURI
                  }

                </td>





                <td>


                  {
                    user?.role === "admin" &&
                    document.status === "Pending" &&

                    <>

                    <button

                      onClick={() =>
                        handleVerify(
                          document.documentId
                        )
                      }

                    >

                      Verify

                    </button>



                    <button

                      onClick={() =>
                        handleReject(
                          document.documentId
                        )
                      }

                    >

                      Reject

                    </button>


                    </>

                  }







                  {
                    user?.role === "owner" &&

                    <button

                      onClick={() =>
                        setSelectedDocumentId(
                          document.documentId
                        )
                      }

                    >

                      Select Upload

                    </button>

                  }






                  <Link

                    to={`/documents/${document.documentId}`}

                  >

                    View

                  </Link>



                </td>



              </tr>



            ))

          }



        </tbody>



      </table>



    </div>

  );


}


export default Documents;