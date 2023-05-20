const DeleteModal = (props: { muebleId: string | number; onDelete: (muebleId: string | number) => void }) => {
    const muebleId: string | number = props.muebleId;
    const onDelete: (muebleId: string | number) => void = props.onDelete;

    const handleConfirmDelete = () => {
        onDelete(muebleId);
    };


    return (
        <div id={"deleteSerieModal" + muebleId} className="modal" tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Esborrar sèrie del moble sencera</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <p>Esteu segurs que voleu esborrar el moble i tots els seus models?</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Tancar</button>
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={handleConfirmDelete}>Esborrar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeleteModal;